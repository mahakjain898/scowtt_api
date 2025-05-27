import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const facts = await prisma.fact.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(facts);
  } catch (error) {
    console.error("Error fetching facts:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
