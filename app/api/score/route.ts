import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

const scoreSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  usn: z.string().min(4).max(20).trim().toUpperCase(),
  score: z.number().int().nonnegative().max(9999),
  progress: z.object({
    unlocked: z.array(z.number()).optional(),
    completed: z.array(z.number()).optional(),
    scores: z.record(z.string(), z.number()).optional(),
    powerups: z.object({
      hint: z.number(),
      skip: z.number(),
      freeze: z.number()
    }).optional(),
    telemetry: z.array(z.any()).optional(),
    levelState: z.any().optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = scoreSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: 'error', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const update: any = {
      $set: { name: data.name, lastActive: new Date() },
      $max: { score: data.score },
    };

    if (data.progress) {
      if (data.progress.unlocked) update.$set.unlocked = data.progress.unlocked;
      if (data.progress.completed) update.$set.completed = data.progress.completed;
      if (data.progress.scores) update.$set.scores = data.progress.scores;
      if (data.progress.powerups) update.$set.powerups = data.progress.powerups;
      if (data.progress.telemetry) update.$set.telemetry = data.progress.telemetry;
      if (data.progress.levelState) update.$set.levelState = data.progress.levelState;
    }

    await User.findOneAndUpdate(
      { usn: data.usn },
      update,
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Score submitted successfully' 
    }, { status: 201 });

  } catch (err) {
    console.error('Score submission error:', err);
    return NextResponse.json(
      { status: 'error', error: 'Failed to record score' },
      { status: 500 }
    );
  }
}
