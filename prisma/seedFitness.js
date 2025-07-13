import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const S3_BASE = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/";

const fitnessPrograms = [
  {
    title: "Shredded in 6 Weeks",
    description: "Hypertrophy-focused fat loss program with cardio & nutrition add-ons.",
    image: S3_BASE + "shred6.jpg",
    video: S3_BASE + "shred6.mp4",
    pdfUrl: S3_BASE + "pdfs/shred6.pdf",
    price: 50.00,
    stripePriceId: "price_xxx_shred6", // TODO: Replace with real Stripe price ID
    isActive: true,
    duration: "6 weeks",
    difficulty: "Intermediate",
    equipment: JSON.stringify([
      "Dumbbells",
      "Barbell",
      "Weight plates",
      "Pull-up bar",
      "Resistance bands",
      "Cardio equipment (optional)"
    ]),
    goals: JSON.stringify([
      "Lose body fat while maintaining muscle",
      "Improve cardiovascular fitness",
      "Build lean muscle mass",
      "Increase overall strength"
    ]),
    instructions: `SHREDDED IN 6 WEEKS - COMPLETE INSTRUCTIONS

PROGRAM OVERVIEW:
This 6-week transformation program is designed to help you lose body fat while building lean muscle mass. The program combines strength training, cardio, and nutrition to maximize your results.

WEEK 1-2: FOUNDATION PHASE
Focus on establishing proper form and building endurance. Start with lighter weights and perfect your technique.

WEEK 3-4: INTENSITY PHASE
Increase weights and add more compound movements. Challenge yourself while maintaining good form.

WEEK 5-6: PEAK PHASE
Maximum intensity with advanced techniques like supersets and drop sets.

WORKOUT SCHEDULE:
- Monday: Upper Body Push
- Tuesday: Lower Body
- Wednesday: Rest/Cardio
- Thursday: Upper Body Pull
- Friday: Full Body
- Saturday: Cardio + Core
- Sunday: Rest

NUTRITION GUIDELINES:
- Calculate your maintenance calories
- Create a 300-500 calorie deficit
- Protein: 1.6-2.2g per kg bodyweight
- Carbs: 2-4g per kg bodyweight
- Fats: 0.8-1.2g per kg bodyweight

RECOVERY TIPS:
- Get 7-9 hours of sleep per night
- Stay hydrated (3-4 liters of water daily)
- Consider foam rolling and stretching
- Listen to your body and adjust intensity as needed

PROGRESS TRACKING:
- Take progress photos weekly
- Track your weight and measurements
- Log your workouts and weights
- Monitor your energy levels and recovery

Remember: Consistency is key! Stick to the program and trust the process.`,
    programText: `SHREDDED IN 6 WEEKS - COMPLETE PROGRAM DETAILS

WEEK 1-2: FOUNDATION PHASE

DAY 1: UPPER BODY PUSH
1. Bench Press: 4 sets x 8-12 reps
   - Rest: 2-3 minutes between sets
   - Focus on controlled descent and explosive ascent
   
2. Overhead Press: 3 sets x 10-12 reps
   - Rest: 2 minutes between sets
   - Keep core tight and avoid arching back
   
3. Incline Dumbbell Press: 3 sets x 10-12 reps
   - Rest: 2 minutes between sets
   - Use 30-45 degree incline
   
4. Lateral Raises: 3 sets x 12-15 reps
   - Rest: 90 seconds between sets
   - Keep slight bend in elbows
   
5. Tricep Dips: 3 sets x 10-12 reps
   - Rest: 90 seconds between sets
   - Add weight if bodyweight becomes easy

DAY 2: LOWER BODY
1. Squats: 4 sets x 8-12 reps
   - Rest: 3 minutes between sets
   - Focus on depth and form
   
2. Romanian Deadlifts: 3 sets x 10-12 reps
   - Rest: 2-3 minutes between sets
   - Keep bar close to legs
   
3. Leg Press: 3 sets x 10-12 reps
   - Rest: 2 minutes between sets
   - Adjust foot position for different emphasis
   
4. Leg Extensions: 3 sets x 12-15 reps
   - Rest: 90 seconds between sets
   - Focus on peak contraction
   
5. Calf Raises: 4 sets x 15-20 reps
   - Rest: 60 seconds between sets
   - Full range of motion

DAY 3: UPPER BODY PULL
1. Pull-ups: 4 sets x 6-10 reps
   - Rest: 2-3 minutes between sets
   - Use assistance if needed
   
2. Barbell Rows: 3 sets x 10-12 reps
   - Rest: 2 minutes between sets
   - Keep chest up and core tight
   
3. Lat Pulldowns: 3 sets x 10-12 reps
   - Rest: 2 minutes between sets
   - Pull to upper chest
   
4. Bicep Curls: 3 sets x 12-15 reps
   - Rest: 90 seconds between sets
   - Control the movement
   
5. Hammer Curls: 3 sets x 12-15 reps
   - Rest: 90 seconds between sets
   - Alternate arms

DAY 4: CARDIO + CORE
1. HIIT Cardio: 20 minutes
   - 30 seconds high intensity
   - 30 seconds rest
   - Repeat for 20 minutes
   
2. Planks: 3 sets x 60 seconds
   - Rest: 60 seconds between sets
   - Maintain straight line
   
3. Russian Twists: 3 sets x 20 each side
   - Rest: 60 seconds between sets
   - Add weight if needed
   
4. Leg Raises: 3 sets x 15 reps
   - Rest: 60 seconds between sets
   - Control the movement

WEEK 3-4: INTENSITY PHASE

DAY 1: UPPER BODY PUSH (ENHANCED)
1. Bench Press: 4 sets x 6-10 reps (increase weight)
2. Overhead Press: 3 sets x 8-10 reps
3. Incline Dumbbell Press: 3 sets x 8-10 reps
4. Lateral Raises: 3 sets x 10-12 reps
5. Tricep Dips: 3 sets x 8-10 reps
6. Push-ups: 3 sets to failure

DAY 2: LOWER BODY (ENHANCED)
1. Squats: 4 sets x 6-10 reps (increase weight)
2. Romanian Deadlifts: 3 sets x 8-10 reps
3. Leg Press: 3 sets x 8-10 reps
4. Leg Extensions: 3 sets x 10-12 reps
5. Calf Raises: 4 sets x 12-15 reps
6. Lunges: 3 sets x 10 each leg

DAY 3: UPPER BODY PULL (ENHANCED)
1. Pull-ups: 4 sets x 8-12 reps
2. Barbell Rows: 3 sets x 8-10 reps
3. Lat Pulldowns: 3 sets x 8-10 reps
4. Bicep Curls: 3 sets x 10-12 reps
5. Hammer Curls: 3 sets x 10-12 reps
6. Face Pulls: 3 sets x 12-15 reps

DAY 4: CARDIO + CORE (ENHANCED)
1. HIIT Cardio: 25 minutes
2. Planks: 3 sets x 90 seconds
3. Russian Twists: 3 sets x 25 each side
4. Leg Raises: 3 sets x 20 reps
5. Mountain Climbers: 3 sets x 30 seconds

WEEK 5-6: PEAK PHASE

DAY 1: UPPER BODY PUSH (MAXIMUM INTENSITY)
1. Bench Press: 4 sets x 4-8 reps (maximum weight)
2. Overhead Press: 3 sets x 6-8 reps
3. Incline Dumbbell Press: 3 sets x 6-8 reps
4. Lateral Raises: 3 sets x 8-10 reps
5. Tricep Dips: 3 sets x 6-8 reps
6. Push-ups: 3 sets to failure
7. Superset: Dips + Push-ups (3 rounds)

DAY 2: LOWER BODY (MAXIMUM INTENSITY)
1. Squats: 4 sets x 4-8 reps (maximum weight)
2. Romanian Deadlifts: 3 sets x 6-8 reps
3. Leg Press: 3 sets x 6-8 reps
4. Leg Extensions: 3 sets x 8-10 reps
5. Calf Raises: 4 sets x 10-12 reps
6. Lunges: 3 sets x 8 each leg
7. Superset: Squats + Lunges (3 rounds)

DAY 3: UPPER BODY PULL (MAXIMUM INTENSITY)
1. Pull-ups: 4 sets x 10-15 reps
2. Barbell Rows: 3 sets x 6-8 reps
3. Lat Pulldowns: 3 sets x 6-8 reps
4. Bicep Curls: 3 sets x 8-10 reps
5. Hammer Curls: 3 sets x 8-10 reps
6. Face Pulls: 3 sets x 10-12 reps
7. Superset: Curls + Hammer Curls (3 rounds)

DAY 4: CARDIO + CORE (MAXIMUM INTENSITY)
1. HIIT Cardio: 30 minutes
2. Planks: 3 sets x 120 seconds
3. Russian Twists: 3 sets x 30 each side
4. Leg Raises: 3 sets x 25 reps
5. Mountain Climbers: 3 sets x 45 seconds
6. Burpees: 3 sets x 10 reps

NUTRITION GUIDELINES (DETAILED):

CALORIE CALCULATION:
- Calculate your BMR using the Mifflin-St Jeor equation
- Multiply by activity factor (1.2-1.9)
- Subtract 300-500 calories for fat loss

MACRONUTRIENT BREAKDOWN:
Protein: 1.6-2.2g per kg bodyweight
- Sources: Chicken, fish, lean beef, eggs, protein powder
- Distribute evenly throughout the day

Carbohydrates: 2-4g per kg bodyweight
- Sources: Rice, potatoes, oats, fruits, vegetables
- Higher on workout days, lower on rest days

Fats: 0.8-1.2g per kg bodyweight
- Sources: Nuts, olive oil, avocado, fatty fish
- Essential for hormone production

MEAL TIMING:
- Pre-workout: 2-3 hours before (balanced meal)
- Post-workout: Within 30 minutes (protein + carbs)
- Bedtime: Casein protein or cottage cheese

HYDRATION:
- Aim for 3-4 liters of water daily
- Add electrolytes during intense workouts
- Monitor urine color (should be light yellow)

SUPPLEMENTATION RECOMMENDATIONS:

ESSENTIAL SUPPLEMENTS:
1. Whey Protein: 20-30g post-workout
2. Creatine Monohydrate: 5g daily
3. Multivitamin: Daily
4. Omega-3: 1-2g daily

OPTIONAL SUPPLEMENTS:
1. BCAAs: During fasted workouts
2. Pre-workout: 30 minutes before training
3. Vitamin D: 2000-4000 IU daily
4. Magnesium: 200-400mg before bed

PROGRESS TRACKING SYSTEM:

WEEKLY CHECK-INS:
- Weight measurement (same time, same scale)
- Progress photos (front, back, side)
- Body measurements (chest, waist, arms, legs)
- Workout performance (weights, reps, sets)

MONTHLY ASSESSMENTS:
- Body composition analysis
- Strength testing (1RM on main lifts)
- Progress photo comparison
- Program adjustments if needed

RECOVERY PROTOCOLS:

SLEEP OPTIMIZATION:
- 7-9 hours per night
- Consistent sleep schedule
- Dark, cool room (65-68°F)
- No screens 1 hour before bed

MOBILITY WORK:
- Daily stretching routine
- Foam rolling 3-4 times per week
- Yoga or mobility work 2-3 times per week

STRESS MANAGEMENT:
- Meditation or deep breathing
- Regular walks in nature
- Adequate social connection
- Work-life balance

TROUBLESHOOTING GUIDE:

IF YOU'RE NOT LOSING WEIGHT:
- Recalculate your calorie needs
- Increase cardio frequency
- Check for hidden calories
- Ensure adequate sleep

IF YOU'RE TOO TIRED:
- Reduce training intensity
- Increase rest days
- Check nutrition adequacy
- Consider deload week

IF YOU'RE NOT GAINING STRENGTH:
- Ensure progressive overload
- Check form on exercises
- Increase protein intake
- Improve sleep quality

SUCCESS TIPS:
1. Consistency beats perfection
2. Track everything
3. Be patient with results
4. Celebrate small wins
5. Adjust as needed
6. Stay accountable
7. Focus on the process
8. Trust the program

Remember: This is a marathon, not a sprint. Stay consistent, trust the process, and the results will come!`,
    explanationVideo: S3_BASE + "videos/shred6_explanation.mp4"
  },
  {
    title: "Precision Growth",
    description: "Gain with control. Maintain leanness while adding clean muscle.",
    image: S3_BASE + "precisiongrowth.jpg",
    video: S3_BASE + "precisiongrowth.mp4",
    pdfUrl: S3_BASE + "pdfs/precisiongrowth.pdf",
    price: 50.00,
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
    programText: `PRECISION GROWTH - 12 WEEK PROGRAM

PHASE 1: WEEKS 1-4 - FOUNDATION
Focus on perfecting form and establishing baseline strength.

PHASE 2: WEEKS 5-8 - BUILDING
Increase volume and introduce more advanced techniques.

PHASE 3: WEEKS 9-12 - OPTIMIZATION
Peak performance with maximum efficiency.

[Detailed workout plans for each phase would be included here]`,
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
    isActive: true,
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
      console.log(`Program "${program.title}" already exists, skipping...`);
      continue;
    }
    
    const createdProgram = await prisma.fitnessProgram.create({
      data: program
    });
    
    console.log(`✅ Created fitness program: ${createdProgram.title}`);
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