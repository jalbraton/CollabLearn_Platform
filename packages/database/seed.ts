import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@collablearn.com' },
    update: {},
    create: {
      email: 'demo@collablearn.com',
      name: 'Demo User',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: {},
    create: {
      id: 'demo-workspace',
      name: 'Demo Workspace',
      description: 'A demonstration workspace for testing',
      visibility: 'PRIVATE',
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log('✅ Created demo workspace:', demoWorkspace.name);

  // Create demo page
  const demoPage = await prisma.page.create({
    data: {
      title: 'Welcome to CollabLearn',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to CollabLearn Platform' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a demo page. Start collaborating now!' },
            ],
          },
        ],
      }),
      workspaceId: demoWorkspace.id,
      createdById: demoUser.id,
    },
  });

  console.log('✅ Created demo page:', demoPage.title);

  // Create demo tags
  const tags = ['Getting Started', 'Documentation', 'Tutorial'];
  for (const tagName of tags) {
    await prisma.tag.create({
      data: {
        name: tagName,
        color: '#667eea',
        workspaceId: demoWorkspace.id,
      },
    });
  }

  console.log('✅ Created demo tags');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
