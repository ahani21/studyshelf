import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { addDays, subDays } from 'date-fns';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// NOTE: Once you log in via Clerk for the first time, you can replace this ID
// with your actual Clerk User ID so the demo data shows up in your dashboard.
const DEMO_USER_ID = "user_3Czvz17w5LgY4CHi8S6FEux5dtH";

async function main() {
  console.log('Seeding database...');

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: 'demo@studyshelf.app',
      role: 'admin',
    },
  });

  // 2. Create Tags
  const tagNames = [
    'machine-learning', 'web-dev', 'system-design', 'mathematics', 
    'productivity', 'algorithms', 'react', 'python', 'database', 'ui-ux'
  ];
  
  const tags = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, color: '#D97706' },
    });
    tags.push(tag);
  }

  // 3. Create Collections
  const collections = [
    { name: 'Computer Science Core', icon: '💻' },
    { name: 'AI & Machine Learning', icon: '🧠' },
    { name: 'Web Development', icon: '🌐' },
    { name: 'Productivity Methods', icon: '⏱️' },
    { name: 'Design Systems', icon: '🎨' },
  ];

  const createdCollections = [];
  for (const col of collections) {
    const created = await prisma.collection.create({
      data: {
        userId: user.id,
        name: col.name,
        icon: col.icon,
      }
    });
    createdCollections.push(created);
  }

  // 4. Create 20 Resources with SRS Data
  const today = new Date();
  
  // Helper to generate resources
  const generateResource = async (index: number, collectionId: number, isDueToday: boolean, status: 'new' | 'learning' | 'mastered') => {
    let interval = 1;
    let dueDate = today;
    let easeFactor = 2.5;

    if (status === 'new') {
      interval = 1;
      dueDate = isDueToday ? today : addDays(today, 1);
    } else if (status === 'learning') {
      interval = Math.floor(Math.random() * 10) + 3; // 3-12 days
      dueDate = isDueToday ? today : addDays(today, interval);
      easeFactor = 2.2;
    } else if (status === 'mastered') {
      interval = Math.floor(Math.random() * 40) + 60; // 60-100 days
      dueDate = isDueToday ? today : addDays(today, 5);
      easeFactor = 2.8;
    }

    const resource = await prisma.resource.create({
      data: {
        userId: user.id,
        url: `https://example.com/article-${index}`,
        canonicalUrl: `https://example.com/article-${index}`,
        title: `Study Resource ${index}: Deep Dive`,
        description: `An in-depth look at topic ${index} for spaced repetition.`,
        tags: {
          create: [
            {
              tagId: tags[index % tags.length].id,
              source: 'user'
            }
          ]
        },
        collections: {
          create: [
            { collectionId }
          ]
        }
      }
    });

    const srsData = await prisma.sRSData.create({
      data: {
        resourceId: resource.id,
        interval,
        easeFactor,
        dueDate,
        reviewCount: status === 'new' ? 0 : 5,
        lastReviewed: status === 'new' ? null : subDays(today, interval)
      }
    });

    await prisma.resource.update({
      where: { id: resource.id },
      data: { srsId: srsData.id }
    });
  };

  // Generate 8 "due today" resources
  for (let i = 1; i <= 8; i++) {
    await generateResource(i, createdCollections[i % 5].id, true, i % 2 === 0 ? 'learning' : 'new');
  }

  // Generate 12 other resources (not due today)
  for (let i = 9; i <= 20; i++) {
    await generateResource(i, createdCollections[i % 5].id, false, i % 3 === 0 ? 'mastered' : 'learning');
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
