import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image, poseType } = await request.json();

    if (!image || !poseType) {
      return NextResponse.json({ error: "Missing required fields (image, poseType)" }, { status: 400 });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Dynamic, premium AI insights depending on the pose
    let definition = "";
    let fatDistribution = "";
    let posture = "";

    if (poseType === 'front') {
      definition = "Upper chest showing increased tightness at clavicular insertions. Deltoids demonstrating initial fiber separation from lateral triceps. Abdominal line showing early vascular outlining in the upper oblique region.";
      fatDistribution = "Subcutaneous lipid deposits in lower pectoral area reduced by ~4%. Upper ab region has slightly hardened. Visceral fat in obliques has decreased, narrowing waist profile.";
      posture = "Neutral shoulder horizontal alignment detected. Minor chest contraction (slight rounding forward) noted, likely from excessive chest training volume. Keep back muscle volume high today.";
    } else if (poseType === 'side') {
      definition = "Tricep lateral head beginning to show clean insertion lines. Hamstring-to-quad split showing initial indentation on outer thigh. Core wall flat and braced.";
      fatDistribution = "Lower back adipose tissue (love handles) demonstrates a visible drop in thickness. Subcutaneous hip fat is slightly tighter.";
      posture = "Anterior Pelvic Tilt (APT) score: Mild (approx 6-8 degrees of pelvic tilt). Suggest focus on glute contraction and core brace during compound lifts (Squats, deadlifts). Forward head posture detected: ~2cm anterior shift.";
    } else {
      // back pose
      definition = "Latissimus dorsi showing wider flare and lower insertion definition. Rhomboid definition and trap thickness clearly visible under contraction. Rear delts show initial hypertrophy.";
      fatDistribution = "Mid-back fat folds show 8% reduction. Adipose layer covering lower back/erectors is thinning, improving visibility of lower spinal erector columns.";
      posture = "Scapular retraction is balanced. Minor upward rotation of left scapula detected. Ensure pull sessions are balanced with equal unilateral loading (Dumbbell rows).";
    }

    return NextResponse.json({
      success: true,
      insights: {
        timestamp: new Date().toISOString().split('T')[0],
        definition,
        fatDistribution,
        posture,
        readinessScore: Math.floor(82 + Math.random() * 12),
        recommendations: poseType === 'front' ? "Add 2 extra sets of Cable Flyes to widen chest sweep." : poseType === 'side' ? "Brace core actively on all overhead presses to correct APT." : "Add facepulls to your pull routine to balance trap tightness."
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze photo";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
