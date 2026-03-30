import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useSubmitSurvey,
  SurveySubmissionClassAttendance,
  SurveySubmissionStudyHoursPerWeek,
  SurveySubmissionDistractionsItem,
  SurveySubmissionFeelsProductive,
  SurveySubmissionSleepHours,
  SurveySubmissionProductivityHabitsItem,
} from "@workspace/api-client-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const formSchema = z.object({
  major: z.string().min(2, { message: "Please enter your major." }),
  classAttendance: z.nativeEnum(SurveySubmissionClassAttendance, {
    required_error: "Please select an option.",
  }),
  studyHoursPerWeek: z.nativeEnum(SurveySubmissionStudyHoursPerWeek, {
    required_error: "Please select your study hours.",
  }),
  distractions: z
    .array(z.nativeEnum(SurveySubmissionDistractionsItem))
    .min(1, { message: "Select at least one." }),
  feelsProductive: z.nativeEnum(SurveySubmissionFeelsProductive, {
    required_error: "Please select an option.",
  }),
  sleepHours: z.nativeEnum(SurveySubmissionSleepHours, {
    required_error: "Please select your sleep hours.",
  }),
  productivityHabits: z
    .array(z.nativeEnum(SurveySubmissionProductivityHabitsItem))
    .min(1, { message: "Select at least one." }),
  routineChange: z.string().optional(),
});

type SurveyFormValues = z.infer<typeof formSchema>;

const distractionsList = [
  { id: SurveySubmissionDistractionsItem.phone_social_media, label: "Phone / Social Media" },
  { id: SurveySubmissionDistractionsItem.friends, label: "Friends" },
  { id: SurveySubmissionDistractionsItem.tv_netflix, label: "TV / Netflix" },
  { id: SurveySubmissionDistractionsItem.gaming, label: "Gaming" },
  { id: SurveySubmissionDistractionsItem.noise, label: "Noise" },
  { id: SurveySubmissionDistractionsItem.other, label: "Other" },
];

const habitsList = [
  { id: SurveySubmissionProductivityHabitsItem.gym, label: "Gym / Exercise" },
  { id: SurveySubmissionProductivityHabitsItem.planner, label: "Using a Planner" },
  { id: SurveySubmissionProductivityHabitsItem.friends, label: "Study with Friends" },
  { id: SurveySubmissionProductivityHabitsItem.music, label: "Listening to Music" },
  { id: SurveySubmissionProductivityHabitsItem.breaks, label: "Taking Breaks" },
  { id: SurveySubmissionProductivityHabitsItem.nothing, label: "Nothing Specific" },
];

function SectionDivider() {
  return <div className="border-t border-border my-8" />;
}

function QuestionLabel({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
        {number}
      </span>
      <span className="text-sm font-semibold text-foreground leading-snug">{text}</span>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitMutation = useSubmitSurvey();

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      major: "",
      distractions: [],
      productivityHabits: [],
      routineChange: "",
    },
  });

  function onSubmit(data: SurveyFormValues) {
    submitMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setLocation("/thank-you");
        },
        onError: () => {
          toast({
            title: "Submission failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col items-center px-4 py-16">
      {/* Header */}
      <div className="w-full max-w-lg text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">College Student Survey</p>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Lifestyle & Productivity Survey
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Help us understand how students balance academics, sleep, and daily habits.
          Takes about 2 minutes.
        </p>
        <Link href="/results" className="inline-block mt-4 text-xs text-primary hover:underline underline-offset-2">
          View results dashboard
        </Link>
      </div>

      {/* Form card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-border shadow-sm p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">

            {/* Q1: Major */}
            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <QuestionLabel number={1} text="What is your major?" />
                  <FormControl>
                    <Input
                      placeholder="e.g. Computer Science, Psychology"
                      className="h-10 text-sm"
                      data-testid="input-major"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q2: Class Attendance */}
            <FormField
              control={form.control}
              name="classAttendance"
              render={({ field }) => (
                <FormItem>
                  <QuestionLabel number={2} text="How often do you go to class?" />
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-2"
                      data-testid="radio-classAttendance"
                    >
                      {[
                        { value: SurveySubmissionClassAttendance.every_class, label: "Every class" },
                        { value: SurveySubmissionClassAttendance.most_classes, label: "Most classes" },
                        { value: SurveySubmissionClassAttendance.sometimes, label: "Sometimes" },
                        { value: SurveySubmissionClassAttendance.rarely, label: "Rarely" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                            field.value === opt.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem value={opt.value} className="sr-only" />
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              field.value === opt.value ? "border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            {field.value === opt.value && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </span>
                          {opt.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q3: Study Hours */}
            <FormField
              control={form.control}
              name="studyHoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <QuestionLabel number={3} text="How many hours do you study per week?" />
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 text-sm" data-testid="select-studyHours">
                        <SelectValue placeholder="Select hours per week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SurveySubmissionStudyHoursPerWeek["0_5"]}>0–5 hours</SelectItem>
                      <SelectItem value={SurveySubmissionStudyHoursPerWeek["6_10"]}>6–10 hours</SelectItem>
                      <SelectItem value={SurveySubmissionStudyHoursPerWeek["11_15"]}>11–15 hours</SelectItem>
                      <SelectItem value={SurveySubmissionStudyHoursPerWeek["16_20"]}>16–20 hours</SelectItem>
                      <SelectItem value={SurveySubmissionStudyHoursPerWeek["20_plus"]}>20+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q4: Distractions */}
            <FormField
              control={form.control}
              name="distractions"
              render={() => (
                <FormItem>
                  <QuestionLabel number={4} text="What distracts you most while studying?" />
                  <p className="text-xs text-muted-foreground mb-3 -mt-2 ml-9">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2 ml-0">
                    {distractionsList.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="distractions"
                        render={({ field }) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                              field.value?.includes(item.id)
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            <FormControl>
                              <Checkbox
                                className="hidden"
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) =>
                                  checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(field.value?.filter((v) => v !== item.id))
                                }
                              />
                            </FormControl>
                            <span
                              className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                field.value?.includes(item.id)
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {field.value?.includes(item.id) && (
                                <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                                  <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            {item.label}
                          </label>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q5: Feels Productive */}
            <FormField
              control={form.control}
              name="feelsProductive"
              render={({ field }) => (
                <FormItem>
                  <QuestionLabel number={5} text="Do you feel productive most days?" />
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-2"
                      data-testid="radio-productive"
                    >
                      {[
                        { value: SurveySubmissionFeelsProductive.yes, label: "Yes" },
                        { value: SurveySubmissionFeelsProductive.no, label: "No" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors flex-1 justify-center ${
                            field.value === opt.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem value={opt.value} className="sr-only" />
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              field.value === opt.value ? "border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            {field.value === opt.value && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </span>
                          {opt.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q6: Sleep Hours */}
            <FormField
              control={form.control}
              name="sleepHours"
              render={({ field }) => (
                <FormItem>
                  <QuestionLabel number={6} text="How many hours of sleep do you usually get?" />
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 text-sm" data-testid="select-sleep">
                        <SelectValue placeholder="Select sleep hours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SurveySubmissionSleepHours.less_than_5}>Less than 5 hours</SelectItem>
                      <SelectItem value={SurveySubmissionSleepHours["5_6"]}>5–6 hours</SelectItem>
                      <SelectItem value={SurveySubmissionSleepHours["7_8"]}>7–8 hours</SelectItem>
                      <SelectItem value={SurveySubmissionSleepHours["9_plus"]}>9+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q7: Productivity Habits */}
            <FormField
              control={form.control}
              name="productivityHabits"
              render={() => (
                <FormItem>
                  <QuestionLabel number={7} text="What do you do to stay productive?" />
                  <p className="text-xs text-muted-foreground mb-3 -mt-2 ml-9">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2">
                    {habitsList.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="productivityHabits"
                        render={({ field }) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                              field.value?.includes(item.id)
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            <FormControl>
                              <Checkbox
                                className="hidden"
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) =>
                                  checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(field.value?.filter((v) => v !== item.id))
                                }
                              />
                            </FormControl>
                            <span
                              className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                field.value?.includes(item.id)
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {field.value?.includes(item.id) && (
                                <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                                  <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            {item.label}
                          </label>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <SectionDivider />

            {/* Q8: Routine Change (Optional) */}
            <FormField
              control={form.control}
              name="routineChange"
              render={({ field }) => (
                <FormItem>
                  <QuestionLabel
                    number={8}
                    text="What is one thing you would change about your daily routine?"
                  />
                  <p className="text-xs text-muted-foreground mb-3 -mt-2 ml-9">Optional</p>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Wake up earlier, spend less time on my phone..."
                      className="min-h-[96px] text-sm resize-none"
                      data-testid="textarea-routineChange"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1" />
                </FormItem>
              )}
            />

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold"
                disabled={submitMutation.isPending}
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Survey"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Responses are anonymous and used for research only.
      </p>
    </div>
  );
}
