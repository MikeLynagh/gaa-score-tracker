
const USER_DATA_KEY = 'gaa_tracker_user_data';

export function getUserData() {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : {
    points: 0,
    badges: [],
    submissions: 0,
    lastSubmission: null
  };
}

export function updateUserData(newData) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(newData));
}

export function addPoints(points) {
  const userData = getUserData();
  userData.points += points;
  userData.submissions += 1;

  // Check for daily submission
  const today = new Date().toDateString();
  if (userData.lastSubmission !== today) {
    userData.points += 5; // Bonus for first submission of the day
    userData.lastSubmission = today;
  }

  checkAndAwardBadges(userData);
  updateUserData(userData);
  return userData;
}

function checkAndAwardBadges(userData) {
  const badgeCriteria = [
    { name: 'Junior B commitment ', condition: userData.submissions >= 1, points: 10 },
    { name: 'Star Club Man', condition: userData.submissions >= 10, points: 50 },
    { name: 'Club All Star', condition: userData.submissions >= 50, points: 100 },
    { name: 'County Level Player', condition: userData.points >= 500, points: 200 },
    { name: 'Future Hall of Famer', condition: userData.submissions >= 100, points: 500 }
  ];

  badgeCriteria.forEach(badge => {
    if (badge.condition && !userData.badges.includes(badge.name)) {
      userData.badges.push(badge.name);
      userData.points += badge.points; // Award points for earning a badge
    }
  });
}