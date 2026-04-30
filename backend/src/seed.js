const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding sample data...');

  const existingUser = await db('users').where({ email: 'admin@tryoutcpns.test' }).first();
  if (!existingUser) {
    const password = await bcrypt.hash('admin123', 10);
    await db('users').insert({
      name: 'Admin Demo',
      email: 'admin@tryoutcpns.test',
      password,
      role: 'admin',
      subscription_status: 'none',
      created_at: new Date()
    });
    console.log('Created admin user admin@tryoutcpns.test / admin123');
  }

  const packageCount = await db('packages').count('id as count').first();
  if (Number(packageCount.count) === 0) {
    await db('packages').insert([
      { name: '1 TO', type: 'limited', quota: 1, duration_days: 7, price: 9999, label: 'Standard' },
      { name: '3 TO', type: 'limited', quota: 3, duration_days: 14, price: 29999, label: 'Paling Populer' },
      { name: '6 TO', type: 'limited', quota: 6, duration_days: 30, price: 49999, label: 'Best Value' },
      { name: '10 TO', type: 'limited', quota: 10, duration_days: 45, price: 79999, label: 'Super Hemat' },
      { name: 'Unlimited 7 Hari', type: 'unlimited', quota: null, duration_days: 7, price: 39999, label: 'Unlimited Access 🔥' },
      { name: 'Unlimited 30 Hari', type: 'unlimited', quota: null, duration_days: 30, price: 99999, label: 'Unlimited Access 🔥' }
    ]);
    console.log('Seeded packages');
  }

  const categoriesCount = await db('categories').count('id as count').first();
  if (Number(categoriesCount.count) === 0) {
    await db('categories').insert([
      { name: 'TIU', created_at: new Date() },
      { name: 'TWK', created_at: new Date() },
      { name: 'TKP', created_at: new Date() }
    ]);
    console.log('Seeded categories');
  }

  const tryoutCount = await db('tryouts').count('id as count').first();
  if (Number(tryoutCount.count) === 0) {
    await db('tryouts').insert([
      { title: 'TO 1', created_at: new Date() },
      { title: 'TO 2', created_at: new Date() }
    ]);
    console.log('Seeded tryouts');
  }

  const questionsCount = await db('questions').count('id as count').first();
  if (Number(questionsCount.count) === 0) {
    await db('questions').insert([
      // TIU Questions
      {
        tryout_id: 1,
        category_id: 1,
        question_text: 'Jika A = 2, B = 3, maka A + B = ?',
        option_a: '4',
        option_b: '5',
        option_c: '6',
        option_d: '7',
        option_e: '8',
        correct_answer: 'B',
        explanation: '2 + 3 = 5',
        created_at: new Date()
      },
      {
        tryout_id: 1,
        category_id: 1,
        question_text: 'Berapakah hasil dari 10 x 5?',
        option_a: '40',
        option_b: '45',
        option_c: '50',
        option_d: '55',
        option_e: '60',
        correct_answer: 'C',
        explanation: '10 x 5 = 50',
        created_at: new Date()
      },
      // TWK Questions
      {
        tryout_id: 1,
        category_id: 2,
        question_text: 'Apa ibu kota Indonesia?',
        option_a: 'Jakarta',
        option_b: 'Surabaya',
        option_c: 'Bandung',
        option_d: 'Medan',
        option_e: 'Semarang',
        correct_answer: 'A',
        explanation: 'Jakarta adalah ibu kota Indonesia',
        created_at: new Date()
      },
      {
        tryout_id: 1,
        category_id: 2,
        question_text: 'Siapa presiden pertama Indonesia?',
        option_a: 'Soekarno',
        option_b: 'Soeharto',
        option_c: 'BJ Habibie',
        option_d: 'Abdurrahman Wahid',
        option_e: 'Megawati',
        correct_answer: 'A',
        explanation: 'Soekarno adalah presiden pertama Indonesia',
        created_at: new Date()
      },
      // TKP Questions (scale 1-5)
      {
        tryout_id: 1,
        category_id: 3,
        question_text: 'Seberapa penting integritas dalam bekerja?',
        option_a: 'Sangat tidak penting',
        option_b: 'Tidak penting',
        option_c: 'Biasa saja',
        option_d: 'Penting',
        option_e: 'Sangat penting',
        correct_answer: 'E', // This will be scored as 5
        explanation: 'Integritas sangat penting dalam bekerja',
        created_at: new Date()
      },
      {
        tryout_id: 1,
        category_id: 3,
        question_text: 'Seberapa sering Anda membantu rekan kerja?',
        option_a: 'Tidak pernah',
        option_b: 'Jarang',
        option_c: 'Kadang-kadang',
        option_d: 'Sering',
        option_e: 'Selalu',
        correct_answer: 'D', // This will be scored as 4
        explanation: 'Membantu rekan kerja menunjukkan kerja sama tim',
        created_at: new Date()
      }
    ]);
    console.log('Seeded sample questions');
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
