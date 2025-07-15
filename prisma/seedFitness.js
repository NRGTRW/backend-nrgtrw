import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const S3_BASE = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/";

const fitnessPrograms = [
  {
    title: "Shredded in 6 Weeks",
    description: "Aggressive fat loss while preserving muscle. 6-week PPL program with high protein, low carb diet, and strategic cardio.",
    image: S3_BASE + "shred6.jpg", // Cover image
    video: S3_BASE + "shred6.mp4", // Temporary video URL (same as Fitness.jsx)
    pdfUrl: S3_BASE + "pdfs/shred6.pdf", // Placeholder, update if needed
    price: 100.00,
    stripePriceId: "price_xxx_shred6", // TODO: Replace with real Stripe price ID
    isActive: true, // Locked for now
    duration: "6 weeks (+2 week adaptation)",
    equipment: JSON.stringify([
      "Dumbbells",
      "Barbell",
      "Weight plates",
      "Pull-up bar",
      "Resistance bands",
      "Cardio equipment (optional)"
    ]),
    goals: JSON.stringify([
      "Aggressive fat loss",
      "Preserve muscle mass",
      "Build discipline and consistency",
      "Improve cardiovascular fitness"
    ]),
    instructions: `Shredded in 6 Weeks: Key Principles

- Aggressive but sustainable fat loss approach
- High-frequency Push/Pull/Legs (PPL) split to maximize muscle retention
- Weekly progression in both training intensity and cardio volume
- Whole-food, high-protein, low-carb nutrition for optimal results
- Strategic use of LISS and HIIT cardio for fat loss and heart health
- Built-in adaptation phase for safe transition into a calorie deficit
- Mindset focus: Discipline, consistency, and embracing discomfort
- Weekly check-ins and adjustments to ensure continued progress
- Designed for rapid results without sacrificing muscle or health
`,
    programText: `🔥 Shredded in 6 Weeks Quick Guide

Goal: Aggressive fat loss while preserving muscle
Duration: 6 weeks (+Optional 2-Week Adaptation)
Training Split: 6-day Push/Pull/Legs (PPL), twice/week
Diet: High protein, low carb, moderate fat (whole foods only)
Refeeds: 1 day/week higher carbs (still below maintenance)
Cardio: 5–6x/week LISS, optional 1–2x/week HIIT
Supplements: Omega-3, Creatine, Electrolytes, (Optional: Whey, Caffeine)

🟢 Adaptation Phase (Weeks -2 to 0)
- Moderate intensity, RIR ~2–3 (easy pace)
- Familiarize with exercises & routine
- 3–4x/week easy LISS (20–30 mins)
- Gradually reduce calories to ease into deficit (~500 kcal deficit)
- Adjust to high protein, moderate fat, lower carbs (~75–100g carbs/day)
- Build consistent habits, discipline, and comfort with routine

📌 Main Program Weekly Overview
Week 1: Moderate (2 RIR most sets) | 4–5x LISS | Discipline & consistency
Week 2: Slight increase (1–2 RIR) | 5x LISS + Optional short HIIT | Building momentum
Week 3: Higher, intensify (0–1 RIR, some sets to failure) | 5–6x LISS + 1–2x HIIT | Grit, pushing through
Week 4: High (strategic intensity, advanced techniques) | 5–6x LISS + 1–2x HIIT | Adapt & grind
Week 5: Peak intensity (Failure, drop sets, supersets) | 6x LISS + 2x HIIT | Maximum push, embrace discomfort
Week 6: Moderate–High (quality reps, slight taper) | 5–6x LISS + Optional HIIT | Finish strong, visualize goal

🏋️ Training Split Overview (Repeat Twice/Week)
Push (Chest, Shoulders, Triceps): Barbell Bench, Incline DB Press, OHP, Lateral Raises, Triceps Extensions (variation on 2nd day)
Pull (Back, Biceps): Deadlift, Pull-ups, Rows, Face Pulls, Curls (variation on 2nd day)
Legs (Quads, Hams, Glutes, Calves): Squats, Leg press, Lunges, RDLs, Leg curls/extensions, Hip thrusts, Calf raises (variation on 2nd day)
Rest: One full rest/active recovery day weekly

🥦 Nutrition Cheat Sheet
Protein: 2–2.2g/kg (lean meats, fish, eggs, dairy)
Fat: ~25–30% calories (avocado, nuts, fatty fish, olive oil)
Carbs: <50g (fibrous veggies, small fruit, honey around workouts)
Refeed: Higher carbs (~150–200g), lower fats, still in deficit
Electrolytes & Hydration: Salt generously, potassium-rich foods, magnesium nightly
Foods: Whole, natural (animal-based, veggies, fruits, honey). No processed food

🏃 Cardio Overview
LISS: 25–40 mins (brisk walking, cycling, incline treadmill)
HIIT (optional): 8–10 intervals (15–20 sec sprint / 40–45 sec slow), max 2x/week

💊 Supplement Quick List
Must-haves: Omega-3 Fish Oil, Creatine (5g/day), Electrolytes
Optional: Whey Protein (post-workout), Caffeine (pre-workout), Magnesium (~300mg nightly)

🧠 Mindset & Motivation Reminders
Weeks 1–2: Build strong habits early. Discipline > Motivation
Weeks 3–4: Embrace discomfort, fatigue is temporary, pride forever
Weeks 5–6: Visualize your shredded result daily. Every rep counts

📏 Tracking & Adjustments
Weekly Check-in: Weight, waist circumference, photos (morning fasted)
Adjust if stalling: Slightly decrease calories (~100–200/day) or slightly increase cardio (+5–10 min daily)
Recovery: Prioritize sleep (8+ hrs), electrolytes, active recovery on rest days

🔑 Post-Cut Transition
Reverse Diet: Gradually increase calories (200–300/day per week)
Maintain training: Reduce cardio gradually, maintain lifting frequency
Set new goal: Performance, muscle gain, or maintain physique

Full PDF: Download the complete guide`,
    explanationVideo: S3_BASE + "shred6.mp4"
  },
  {
    title: "Precision Growth",
    description: "Gain with control. Maintain leanness while adding clean muscle.",
    image: S3_BASE + "precisiongrowth.jpg",
    video: S3_BASE + "precisiongrowth.mp4",
    pdfUrl: S3_BASE + "pdfs/precisiongrowth.pdf",
    price: 100.00,
    stripePriceId: "price_xxx_precision", // TODO: Replace with real Stripe price ID
    isActive: true,
    duration: "12 weeks",
    difficulty: "Advanced",
    equipment: JSON.stringify([
      "Full gym access",
      "Barbell and weight plates",
      "Dumbbells",
      "Cable machine",
      "Pull-up bar",
      "Bench press"
    ]),
    goals: JSON.stringify([
      "Build lean muscle mass",
      "Improve strength progressively",
      "Maintain low body fat percentage",
      "Enhance overall physique"
    ]),
    instructions: `Precision Growth is a 12-week program designed for advanced lifters who want to build muscle while staying lean.

The program uses progressive overload principles with careful attention to nutrition and recovery.

Key principles:
- Progressive overload
- Compound movements priority
- Adequate rest and recovery
- Precision nutrition tracking`,
    programText: `🌱 Precision Growth Quick Guide

Goal: Steady lean muscle growth without excessive fat gain
Duration: Ongoing lean-bulking phase
Training Split: 5-day Push/Pull/Legs/Upper/Lower (PPLUL)
Diet: Small calorie surplus, moderate protein, balanced carbs & fats
Cardio: 2–3x/week Low-intensity
Supplements (Optional): Omega-3, Creatine, Electrolytes, Whey, Caffeine

📌 Program Philosophy Overview
Lean Bulking: Small surplus (+200–300 kcal/day), gaining ~0.25–0.5% bodyweight weekly
Advanced Training: Compound lifts for strength, isolation for aesthetics; intensity techniques (drop sets/rest-pause)
Cardio: Strategic inclusion (2–3x/week) for health and reduced fat gain
Data-Driven: Weekly tracking (weight, measurements, RPE/RIR logs)
Mindset: Daily motivational prompts for discipline & consistency

🗓️ Weekly Training Split (PPLUL)

Day 1: Push (Chest, Shoulders, Triceps) — Bench Press, OHP, Incline DB Press, Lat Raises, Triceps
Day 2: Pull (Back, Rear Delts, Biceps) — Deadlift/Rack Pull, Pull-Ups, Rows, Face Pulls, Curls
Day 3: Legs (Quads, Hams, Glutes, Calves) — Squats, Leg Press, RDL, Leg Curl/Ext, Calf Raises
Day 4: Rest or Active Recovery — Light cardio, mobility, stretching
Day 5: Upper Body (Compound) — Incline Bench, Barbell Rows, Weighted Dips, Cable Rows
Day 6: Lower Body (Compound) — Front Squats, Lunges, Leg Curl, Calves
Day 7: Rest & Recovery — Full rest, meal prep, reflection

🏋️ Daily Workout Structure
Sets: Typically 3–4 per exercise
Reps: Compound lifts (5–8), Accessory lifts (8–15)
Intensity: RIR 1–3 for compound, 0–1 isolation moves
Tempo: Controlled eccentrics, explosive concentrics
Advanced Techniques: Drop sets/rest-pause 1–2 exercises/session (clearly indicated)

🥗 Nutrition Simplified
Calories: Mild surplus (+200–300 kcal daily)
Protein: 1.6–1.8g/kg bodyweight (lean meats, fish, dairy, eggs)
Fat: ~25–30% total calories (avocado, nuts, oils)
Carbs: Remaining calories (~45–55%) around workouts (rice, potatoes, fruits)
Meal Timing: Carbs & protein pre/post-workout, minimal fats around training

🚴 Cardio Guidelines
Frequency: 2–3x/week, ~30 min each
Intensity: Low-intensity (brisk walk, incline treadmill, cycling)
Purpose: Heart health, improved recovery, reduced fat accumulation

💊 Supplement Quick List (Optional)
- Omega-3 Fish Oil (if low fish intake)
- Creatine (0.1g/kg daily)
- Electrolytes (hydration)
- Whey Protein (convenience)
- Caffeine (pre-workout performance)

📈 Tracking Your Progress
Weekly: Weigh-in (consistent conditions)
Biweekly/Monthly: Tape measurements (chest, arms, thighs, waist, hips)
Monthly: Progress photos (front, side, back)
Daily: Training logs (exercise, sets, reps, RPE/RIR)

🔄 Adjustments Based on Feedback
Slow muscle gain: Slightly increase calories (~200 kcal/day)
Excessive fat gain: Tighten diet, or mini-cut (2–6 weeks aggressive deficit)
Plateau in strength: Deload every 4–6 weeks (1 week of reduced volume/intensity)
Fatigue & Burnout: Prioritize recovery (sleep, deload), adjust cardio/volume as needed

🧠 Mindset & Motivation Prompts (Examples)
Discipline Over Motivation: Every rep matters—consistency wins
Visualize Success: See the results before you lift; then make them real
Small Wins: Progress adds up; celebrate incremental improvements
Recovery Mindset: Rest days = Growth days; recovery is essential

📅 Deload Protocol (Every 4–6 Weeks)
Duration: 1 Week
Reduce: Volume (by ~50%) or Intensity (~60% weight)
Purpose: Recover, avoid plateaus, return stronger
`,
    explanationVideo: S3_BASE + "videos/precision_explanation.mp4"
  },
  {
    title: "Aesthetic Push/Pull/Legs",
    description: "Balance, symmetry, and density. Advanced 6-day split.",
    image: S3_BASE + "ppl.jpg",
    video: S3_BASE + "ppl.mp4",
    pdfUrl: S3_BASE + "pdfs/ppl.pdf",
    price: 50.00,
    stripePriceId: "price_xxx_ppl", // TODO: Replace with real Stripe price ID
    isActive: false,
    duration: "8 weeks",
    difficulty: "Advanced",
    equipment: JSON.stringify([
      "Full gym access",
      "Barbell and weight plates",
      "Dumbbells",
      "Cable machine",
      "Pull-up bar",
      "Bench press",
      "Squat rack"
    ]),
    goals: JSON.stringify([
      "Build balanced muscle development",
      "Improve overall symmetry",
      "Increase muscle density",
      "Enhance aesthetic physique"
    ]),
    instructions: `The Aesthetic PPL program is designed for advanced lifters who want to build a balanced, symmetrical physique.

This 6-day split allows for maximum muscle stimulation while providing adequate recovery time.

Training split:
- Day 1: Push (Chest, Shoulders, Triceps)
- Day 2: Pull (Back, Biceps)
- Day 3: Legs
- Day 4: Push
- Day 5: Pull
- Day 6: Legs
- Day 7: Rest`,
    programText: `AESTHETIC PUSH/PULL/LEGS - 8 WEEK PROGRAM

PUSH DAYS:
- Bench Press: 4x6-8
- Overhead Press: 3x8-10
- Incline Dumbbell Press: 3x8-10
- Lateral Raises: 3x12-15
- Tricep Extensions: 3x10-12

PULL DAYS:
- Deadlifts: 4x6-8
- Pull-ups: 4x8-10
- Barbell Rows: 3x8-10
- Lat Pulldowns: 3x10-12
- Bicep Curls: 3x10-12

LEG DAYS:
- Squats: 4x6-8
- Romanian Deadlifts: 3x8-10
- Leg Press: 3x10-12
- Leg Extensions: 3x12-15
- Calf Raises: 4x15-20

[Detailed progression and variation schemes would be included]`,
    explanationVideo: S3_BASE + "videos/ppl_explanation.mp4"
  }
];

async function main() {
  console.log('🌱 Seeding fitness programs...');
  
  for (const program of fitnessPrograms) {
    const existingProgram = await prisma.fitnessProgram.findFirst({
      where: { title: program.title }
    });
    
    if (existingProgram) {
      const updatedProgram = await prisma.fitnessProgram.update({
        where: { id: existingProgram.id },
        data: program
      });
      console.log(`✅ Updated fitness program: ${updatedProgram.title}`);
    } else {
      const createdProgram = await prisma.fitnessProgram.create({
        data: program
      });
      console.log(`✅ Created fitness program: ${createdProgram.title}`);
    }
  }
  
  console.log('🎉 Fitness programs seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding fitness programs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 