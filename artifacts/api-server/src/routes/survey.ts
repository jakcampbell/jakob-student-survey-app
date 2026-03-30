import { Router, type IRouter } from "express";
import { db, surveyResponsesTable } from "@workspace/db";
import { SubmitSurveyBody, GetSurveyResultsResponse } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/survey/submit", async (req, res): Promise<void> => {
  const parsed = SubmitSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const data = parsed.data;

  const [inserted] = await db
    .insert(surveyResponsesTable)
    .values({
      major: data.major,
      classAttendance: data.classAttendance,
      studyHoursPerWeek: data.studyHoursPerWeek,
      distractions: data.distractions as string[],
      feelsProductive: data.feelsProductive,
      sleepHours: data.sleepHours,
      productivityHabits: data.productivityHabits as string[],
      routineChange: data.routineChange ?? null,
    })
    .returning();

  req.log.info({ id: inserted.id }, "Survey response submitted");

  res.status(201).json({ id: inserted.id, message: "Survey submitted successfully" });
});

router.get("/survey/results", async (req, res): Promise<void> => {
  const allResponses = await db.select().from(surveyResponsesTable);
  const total = allResponses.length;

  if (total === 0) {
    res.json(
      GetSurveyResultsResponse.parse({
        totalResponses: 0,
        productivePercentage: 0,
        mostCommonMajors: [],
        classAttendanceBreakdown: [],
        studyHoursBreakdown: [],
        topDistractions: [],
        sleepBreakdown: [],
        topProductivityHabits: [],
      })
    );
    return;
  }

  const productiveCount = allResponses.filter((r) => r.feelsProductive === "yes").length;
  const productivePercentage = Math.round((productiveCount / total) * 100);

  function countField(values: string[]): { answer: string; count: number; percentage: number }[] {
    const counts: Record<string, number> = {};
    for (const v of values) {
      counts[v] = (counts[v] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([answer, count]) => ({
        answer,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  function countArrayField(arrays: string[][]): { answer: string; count: number; percentage: number }[] {
    const counts: Record<string, number> = {};
    for (const arr of arrays) {
      for (const v of arr) {
        counts[v] = (counts[v] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([answer, count]) => ({
        answer,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  const labelMap: Record<string, string> = {
    every_class: "Every class",
    most_classes: "Most classes",
    sometimes: "Sometimes",
    rarely: "Rarely",
    "0_5": "0–5 hrs",
    "6_10": "6–10 hrs",
    "11_15": "11–15 hrs",
    "16_20": "16–20 hrs",
    "20_plus": "20+ hrs",
    phone_social_media: "Phone/social media",
    friends: "Friends",
    tv_netflix: "TV/Netflix",
    gaming: "Gaming",
    noise: "Noise",
    other: "Other",
    yes: "Yes",
    no: "No",
    less_than_5: "Less than 5 hrs",
    "5_6": "5–6 hrs",
    "7_8": "7–8 hrs",
    "9_plus": "9+ hrs",
    gym: "Gym",
    planner: "Planner",
    music: "Music",
    breaks: "Breaks",
    nothing: "Nothing",
  };

  function applyLabels(items: { answer: string; count: number; percentage: number }[]) {
    return items.map((item) => ({
      ...item,
      answer: labelMap[item.answer] ?? item.answer,
    }));
  }

  const mostCommonMajors = countField(allResponses.map((r) => r.major)).slice(0, 5);
  const classAttendanceBreakdown = applyLabels(countField(allResponses.map((r) => r.classAttendance)));
  const studyHoursBreakdown = applyLabels(countField(allResponses.map((r) => r.studyHoursPerWeek)));
  const topDistractions = applyLabels(countArrayField(allResponses.map((r) => r.distractions)));
  const sleepBreakdown = applyLabels(countField(allResponses.map((r) => r.sleepHours)));
  const topProductivityHabits = applyLabels(countArrayField(allResponses.map((r) => r.productivityHabits)));

  req.log.info({ total }, "Survey results fetched");

  res.json(
    GetSurveyResultsResponse.parse({
      totalResponses: total,
      productivePercentage,
      mostCommonMajors,
      classAttendanceBreakdown,
      studyHoursBreakdown,
      topDistractions,
      sleepBreakdown,
      topProductivityHabits,
    })
  );
});

export default router;
