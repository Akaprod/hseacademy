import { db } from '../src/lib/db';
async function main() {
  const c = await db.chapter.count();
  const q = await db.question.count();
  console.log('Chapters:', c, 'Questions:', q);
  await db.$disconnect();
}
main().catch(console.error);