const profileCard = document.getElementById("profileCard");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileImage = document.getElementById("profileImage");

// Dummy data for profiles
const profiles = [
  {
    name: "Alex, 26",
    bio: "Loves painting, hiking, and meaningful conversations.",
    img: "https://via.placeholder.com/300x300?text=Alex"
  },
  {
    name: "Riya, 24",
    bio: "Passionate about music, books and coffee.",
    img: "https://via.placeholder.com/300x300?text=Riya"
  },
  {
    name: "Mohit, 30",
    bio: "Techie, traveler, and foodie.",
    img: "https://via.placeholder.com/300x300?text=Mohit"
  }
];

let currentIndex = 0;

function showProfile(index) {
  if (index >= profiles.length) {
    profileCard.innerHTML = "<h2>No more profiles available.</h2>";
    return;
  }

  profileName.textContent = profiles[index].name;
  profileBio.textContent = profiles[index].bio;
  profileImage.src = profiles[index].img;
}

document.getElementById("likeBtn").addEventListener("click", () => {
  profileCard.style.transform = "translateX(100vw)";
  setTimeout(() => {
    profileCard.style.transform = "translateX(0)";
    showProfile(++currentIndex);
  }, 400);
});

document.getElementById("dislikeBtn").addEventListener("click", () => {
  profileCard.style.transform = "translateX(-100vw)";
  setTimeout(() => {
    profileCard.style.transform = "translateX(0)";
    showProfile(++currentIndex);
  }, 400);
});

document.getElementById("messageBtn").addEventListener("click", () => {
  alert("Messaging feature coming soon!");
});

// Show the first profile on load
showProfile(currentIndex);
