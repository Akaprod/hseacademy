import { db } from '../src/lib/db';
async function main() {
  await db.onlineCourse.update({ where: { slug: 'introduction-qhse' }, data: { totalChapters: 2 } });
  console.log('Updated course 1 totalChapters to 2');
  await db.$disconnect();
}
main().catch(console.error);
