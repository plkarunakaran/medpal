import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMedicationSchema } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, PillBottle } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = insertMedicationSchema.extend({
  scheduleFrequency: z.string().min(1, "Schedule frequency is required"),
  scheduleTime: z.string().min(1, "Schedule time is required"),
});

type FormData = z.infer<typeof formSchema>;

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const medicationColors = [
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "white", label: "White" },
  { value: "pink", label: "Pink" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
];

const medicationShapes = [
  { value: "circle", label: "Round/Circle" },
  { value: "oval", label: "Oval" },
  { value: "rectangle", label: "Rectangle" },
  { value: "square", label: "Square" },
  { value: "capsule", label: "Capsule" },
];

const medicationForms = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" },
  { value: "injection", label: "Injection" },
  { value: "drops", label: "Drops" },
  { value: "cream", label: "Cream" },
  { value: "inhaler", label: "Inhaler" },
];

export default function AddMedicationDialog({ open, onOpenChange }: AddMedicationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      dosage: "",
      form: "",
      color: "",
      shape: "",
      notes: "",
      scheduleFrequency: "",
      scheduleTime: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { scheduleFrequency, scheduleTime, ...medicationData } = data;
      
      // Create a simple schedule structure
      const schedule = {
        frequency: scheduleFrequency,
        time: scheduleTime,
        type: "daily", // Simplified for now
      };

      const response = await apiRequest("POST", "/api/medications", {
        ...medicationData,
        schedule,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Medication added",
        description: "Your medication has been successfully added to your list.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  // Generate pill preview
  const getPillPreview = () => {
    const color = form.watch("color");
    const shape = form.watch("shape");
    const form_type = form.watch("form");

    if (!color || !shape) return null;

    const baseClasses = "flex items-center justify-center shadow-sm";
    const sizeClasses = "w-8 h-8";
    
    const colorClasses = {
      blue: "bg-blue-500",
      red: "bg-red-500", 
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      white: "bg-gray-100 border-2 border-gray-300",
      pink: "bg-pink-500",
      orange: "bg-orange-500",
      purple: "bg-purple-500",
    };

    const shapeClasses = {
      circle: "rounded-full",
      oval: "rounded-full",
      rectangle: "rounded-sm",
      square: "rounded-md",
      capsule: "rounded-full",
    };

    return (
      <div className="w-10 h-10 bg-muted rounded-full border-2 border-border flex items-center justify-center">
        <div className={cn(
          baseClasses,
          sizeClasses,
          colorClasses[color as keyof typeof colorClasses],
          shapeClasses[shape as keyof typeof shapeClasses]
        )}>
          {form_type === 'capsule' ? (
            <div className="w-5 h-6 bg-current rounded-full"></div>
          ) : shape === 'rectangle' || shape === 'square' ? (
            <div className="w-6 h-4 bg-current rounded-sm"></div>
          ) : (
            <div className="w-6 h-6 bg-current rounded-full"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-medication">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PillBottle className="w-5 h-5 text-primary" />
            <span>Add New Medication</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Lisinopril" 
                        {...field} 
                        data-testid="input-medication-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Prinivil" 
                        {...field} 
                        data-testid="input-brand-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 10mg" 
                        {...field} 
                        data-testid="input-dosage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-form">
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicationForms.map((form) => (
                          <SelectItem key={form.value} value={form.value}>
                            {form.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visual Appearance */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Visual Appearance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-color">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {medicationColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shape</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-shape">
                            <SelectValue placeholder="Select shape" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {medicationShapes.map((shape) => (
                            <SelectItem key={shape.value} value={shape.value}>
                              {shape.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Preview</p>
                    {getPillPreview() || (
                      <div className="w-10 h-10 bg-muted rounded-full border-2 border-border flex items-center justify-center">
                        <PillBottle className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduleFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-frequency">
                            <SelectValue placeholder="How often?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="once-daily">Once daily</SelectItem>
                          <SelectItem value="twice-daily">Twice daily</SelectItem>
                          <SelectItem value="three-times-daily">Three times daily</SelectItem>
                          <SelectItem value="four-times-daily">Four times daily</SelectItem>
                          <SelectItem value="as-needed">As needed</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduleTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="time"
                          {...field} 
                          data-testid="input-schedule-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                      placeholder="Any additional instructions or notes..."
                      className="min-h-[100px]"
                      {...field} 
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Medication</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Include this medication in your daily schedule
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-active"
                    />
                  </FormControl>
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
                data-testid="button-add-medication"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add Medication
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
