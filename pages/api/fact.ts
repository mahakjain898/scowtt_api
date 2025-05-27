
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.favoriteMovie) return res.status(400).json({ error: "Favorite movie not set" });

  // Uncomment this if you are testing do not want to reach OPENAI limit
  // return res.status(200).json({ fact: "Fact fetching is temporarily disabled." });
  
  // max 2 requests
  
  const count = await prisma.fact.count({ where: { userId: user.id } });
  if (count >= 2) {
    return res.status(429).json({ error: "Fact limit reached (2 per user)" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a movie trivia expert." },
        { role: "user", content: `Give me a fun fact about "${user.favoriteMovie}".` },
      ],
    });
    const fact = completion.choices[0]?.message?.content ?? "No fact generated.";

    await prisma.fact.create({ data: { userId: user.id, content: fact } });
    res.status(200).json({ fact });
  } catch {
    res.status(500).json({ error: "Failed to fetch fact from OpenAI" });
  }
}
