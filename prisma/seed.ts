import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (await prisma.user.count() || await prisma.skill.count() || await prisma.event.count()) {
    console.log('Database already contains data; seed skipped to preserve it.');
    return;
  }

  // Create skills
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: "React", category: "frontend" } }),
    prisma.skill.create({ data: { name: "Next.js", category: "frontend" } }),
    prisma.skill.create({ data: { name: "TypeScript", category: "frontend" } }),
    prisma.skill.create({ data: { name: "Node.js", category: "backend" } }),
    prisma.skill.create({ data: { name: "Python", category: "backend" } }),
    prisma.skill.create({ data: { name: "PostgreSQL", category: "backend" } }),
    prisma.skill.create({ data: { name: "Figma", category: "design" } }),
    prisma.skill.create({ data: { name: "UI/UX Design", category: "design" } }),
    prisma.skill.create({ data: { name: "Docker", category: "devops" } }),
    prisma.skill.create({ data: { name: "AWS", category: "devops" } }),
    prisma.skill.create({ data: { name: "Machine Learning", category: "data" } }),
    prisma.skill.create({ data: { name: "Cybersecurity", category: "security" } }),
  ]);

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Chen",
      email: "alice@example.com",
      bio: "Full-stack developer with a passion for hackathons",
      experienceLevel: "advanced",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Martinez",
      email: "bob@example.com",
      bio: "Backend engineer and CTF enthusiast",
      experienceLevel: "intermediate",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Johnson",
      email: "carol@example.com",
      bio: "UX designer who loves building beautiful interfaces",
      experienceLevel: "advanced",
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: "Dave Kim",
      email: "dave@example.com",
      bio: "ML engineer looking for hackathon teammates",
      experienceLevel: "beginner",
    },
  });

  // Assign skills to users
  await prisma.userSkill.createMany({
    data: [
      { userId: alice.id, skillId: skills[0].id, proficiency: 5 }, // React
      { userId: alice.id, skillId: skills[1].id, proficiency: 4 }, // Next.js
      { userId: alice.id, skillId: skills[2].id, proficiency: 5 }, // TypeScript
      { userId: bob.id, skillId: skills[3].id, proficiency: 5 },   // Node.js
      { userId: bob.id, skillId: skills[4].id, proficiency: 4 },   // Python
      { userId: bob.id, skillId: skills[11].id, proficiency: 3 },  // Cybersecurity
      { userId: carol.id, skillId: skills[6].id, proficiency: 5 }, // Figma
      { userId: carol.id, skillId: skills[7].id, proficiency: 5 }, // UI/UX
      { userId: carol.id, skillId: skills[0].id, proficiency: 3 }, // React
      { userId: dave.id, skillId: skills[4].id, proficiency: 3 },  // Python
      { userId: dave.id, skillId: skills[10].id, proficiency: 4 }, // ML
    ],
  });

  // Create events
  const hackathon = await prisma.event.create({
    data: {
      name: "HackIndia 2025",
      description: "India's largest student hackathon — build, ship, repeat!",
      type: "hackathon",
      mode: "offline",
      teamSizeMin: 3,
      teamSizeMax: 5,
      location: "Bangalore, India",
      date: "2025-11-15",
      createdBy: alice.id,
    },
  });

  const ctf = await prisma.event.create({
    data: {
      name: "CTF Showdown",
      description: "24-hour capture the flag competition",
      type: "ctf",
      mode: "online",
      teamSizeMin: 2,
      teamSizeMax: 4,
      date: "2025-12-01",
      createdBy: bob.id,
    },
  });

  await prisma.event.create({
    data: {
      name: "BuildForGood",
      description: "Social impact hackathon focused on climate tech",
      type: "hackathon",
      mode: "online",
      teamSizeMin: 2,
      teamSizeMax: 6,
      date: "2025-10-20",
      createdBy: carol.id,
    },
  });

  // Create teams
  const team1 = await prisma.team.create({
    data: {
      name: "Code Crusaders",
      eventId: hackathon.id,
      createdBy: alice.id,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: "ByteBusters",
      eventId: ctf.id,
      createdBy: bob.id,
    },
  });

  // Add team members
  await prisma.teamMember.createMany({
    data: [
      { teamId: team1.id, userId: alice.id, role: "leader" },
      { teamId: team1.id, userId: carol.id, role: "member" },
      { teamId: team2.id, userId: bob.id, role: "leader" },
      { teamId: team2.id, userId: dave.id, role: "member" },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
