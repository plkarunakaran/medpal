import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar } from "lucide-react";

const formSchema = insertAppointmentSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type FormData = z.infer<typeof formSchema>;

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const appointmentTypes = [
  { value: "checkup", label: "Regular Checkup" },
  { value: "consultation", label: "Consultation" },
  { value: "follow-up", label: "Follow-up" },
  { value: "lab", label: "Lab Work" },
  { value: "test", label: "Medical Test" },
  { value: "surgery", label: "Surgery" },
  { value: "therapy", label: "Therapy" },
  { value: "vaccination", label: "Vaccination" },
];

const specialties = [
  { value: "general", label: "General Practice" },
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "urology", label: "Urology" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "otolaryngology", label: "ENT" },
  { value: "oncology", label: "Oncology" },
];

export default function AddAppointmentDialog({ open, onOpenChange }: AddAppointmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorName: "",
      specialty: "",
      clinic: "",
      location: "",
      type: "checkup",
      status: "scheduled",
      notes: "",
      date: "",
      time: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { date, time, ...appointmentData } = data;
      
      // Combine date and time into datetime
      const datetime = new Date(`${date}T${time}`);
      
      const response = await apiRequest("POST", "/api/appointments", {
        ...appointmentData,
        datetime: datetime.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment scheduled",
        description: "Your appointment has been successfully scheduled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-appointment">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <span>Schedule New Appointment</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        min={today}
                        {...field} 
                        data-testid="input-appointment-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field} 
                        data-testid="input-appointment-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Doctor and Specialty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Dr. Sarah Johnson" 
                        {...field} 
                        data-testid="input-doctor-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-specialty">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-appointment-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clinic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic/Hospital Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Heart & Vascular Clinic" 
                        {...field} 
                        data-testid="input-clinic-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full address or room number" 
                        {...field} 
                        data-testid="input-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special instructions, what to bring, fasting requirements, etc..."
                      className="min-h-[100px]"
                      {...field} 
                      data-testid="textarea-appointment-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                variant="secondary"
                data-testid="button-schedule-appointment"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Schedule Appointment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
