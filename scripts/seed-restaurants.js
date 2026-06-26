const BASE_URL = 'https://restaurant.devrajsah.com.np';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgyMjEwNzU4LCJpYXQiOjE3ODIyMDk4NTgsImp0aSI6ImQwZDVkNjA1YzUwZDRmNjNiZGIzZWVmZThiODRjYzRlIiwidXNlcl9pZCI6IjEifQ.4eViufjF8Vvp5aKmF7gaTbSqSKM074OqeKdUMI0pM3A';     // आफ्नो admin token राख्नुस्

const restaurants = [
  { name: 'Momo Palace', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'Newari Kitchen', availability: '2026-12-31', address: 'Patan', city: 'Lalitpur', status: true },
  { name: 'Everest Cafe', availability: '2026-12-31', address: 'Baneshwor', city: 'Kathmandu', status: true },
  { name: 'Himalayan Grill', availability: '2026-12-31', address: 'Lakeside', city: 'Pokhara', status: true },
  { name: 'Thakali Bhanchha', availability: '2026-12-31', address: 'New Road', city: 'Kathmandu', status: true },
  { name: 'Sunrise Bakery', availability: '2026-12-31', address: 'Jhamsikhel', city: 'Lalitpur', status: true },
  { name: 'Roadhouse Cafe', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'OR2K', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'Bhojan Griha', availability: '2026-12-31', address: 'Dillibazar', city: 'Kathmandu', status: true },
  { name: 'Krishnarpan', availability: '2026-12-31', address: 'Durbarmarg', city: 'Kathmandu', status: true },
  { name: 'Stupa View Restaurant', availability: '2026-12-31', address: 'Boudha', city: 'Kathmandu', status: true },
  { name: 'Yangling Tibetan', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'Furi Cafe', availability: '2026-12-31', address: 'Pulchowk', city: 'Lalitpur', status: true },
  { name: 'Cafe du Temple', availability: '2026-12-31', address: 'Bhaktapur', city: 'Bhaktapur', status: true },
  { name: 'Smoke N Grill', availability: '2026-12-31', address: 'Jhamsikhel', city: 'Lalitpur', status: true },
  { name: 'Dwarika Hotel Restaurant', availability: '2026-12-31', address: 'Battisputali', city: 'Kathmandu', status: true },
  { name: 'Purple Hill Cafe', availability: '2026-12-31', address: 'Nagarkot', city: 'Bhaktapur', status: true },
  { name: 'Pokhara Thakali', availability: '2026-12-31', address: 'Damside', city: 'Pokhara', status: true },
  { name: 'Lhasa Kitchen', availability: '2026-12-31', address: 'Boudha', city: 'Kathmandu', status: true },
  { name: 'Chez Caroline', availability: '2026-12-31', address: 'Lazimpat', city: 'Kathmandu', status: true },
  { name: 'Third Eye Restaurant', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'New Everest Steak House', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'Patan Museum Cafe', availability: '2026-12-31', address: 'Patan Durbar Square', city: 'Lalitpur', status: true },
  { name: 'Rosemary Kitchen', availability: '2026-12-31', address: 'Lakeside', city: 'Pokhara', status: true },
  { name: 'Busy Bee Cafe', availability: '2026-12-31', address: 'Thamel', city: 'Kathmandu', status: true },
  { name: 'Cafe Mitra', availability: '2026-12-31', address: 'Sanepa', city: 'Lalitpur', status: true },
  { name: 'Charcoal Brewing Co', availability: '2026-12-31', address: 'Jhamsikhel', city: 'Lalitpur', status: true },
  { name: 'Bhaktapur Thakali', availability: '2026-12-31', address: 'Suryamadhi', city: 'Bhaktapur', status: true },
  { name: 'Mountain Thyme', availability: '2026-12-31', address: 'Nagarkot', city: 'Bhaktapur', status: true },
  { name: 'Tashi Delek Restaurant', availability: '2026-12-31', address: 'Lakeside', city: 'Pokhara', status: true },
];

async function seedRestaurants() {
  for (const restaurant of restaurants) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/restaurant/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(restaurant),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Created: ${restaurant.name} (id: ${data.id})`);
      } else {
        console.log(`❌ Failed: ${restaurant.name}`, data);
      }
    } catch (err) {
      console.log(`❌ Error: ${restaurant.name}`, err.message);
    }
  }
  console.log('Done!');
}

seedRestaurants();