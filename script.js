// === AUTH ===
function signup() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (!u || !p) return alert("Enter username & password");

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[u]) return alert("Username already exists.");

  users[u] = { password: p, likes: [], profile: null };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created. Now log in!");
}

function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[u]?.password === p) {
    localStorage.setItem("loggedInUser", u);
    location.href = "home.html";
  } else {
    alert("Wrong login.");
  }
}

// === HOME ===
if (location.pathname.includes("home.html")) {
  const currentUser = localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  const user = users[currentUser];
  document.getElementById("welcome").textContent = `Welcome, ${currentUser}`;

  if (!user.profile) {
    const name = prompt("Enter your name:");
    const age = prompt("Enter your age:");
    const pronouns = prompt("Your pronouns:");
    const identity = prompt("Your identity:");
    const bio = prompt("Short bio:");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const reader = new FileReader();
      reader.onload = () => {
        user.profile = { name, age, pronouns, identity, bio, image: reader.result };
        users[currentUser] = user;
        localStorage.setItem("users", JSON.stringify(users));
        location.reload();
      };
      reader.readAsDataURL(input.files[0]);
    };
    document.body.appendChild(input);
    input.click();
  }

  const identityFilter = prompt("Filter by identity (or leave blank):");
  const others = Object.entries(users)
    .filter(([k]) => k !== currentUser)
    .map(([k, v]) => ({ ...v.profile, username: k }))
    .filter(p => p && (identityFilter === "" || p.identity.toLowerCase() === identityFilter.toLowerCase()));

  const cardContainer = document.getElementById("card-container");
  let index = 0;

  function getMatchPercent(p1, p2) {
    let score = 0;
    if (p1.identity === p2.identity) score += 40;
    if (p1.pronouns === p2.pronouns) score += 30;
    if (p1.bio && p2.bio && p1.bio.split(" ").some(w => p2.bio.includes(w))) score += 30;
    return score;
  }

  function showProfile(i) {
    if (i >= others.length) {
      cardContainer.innerHTML = "<p>No more profiles.</p>";
      return;
    }
    const p = others[i];
    const percent = getMatchPercent(user.profile, p);
    cardContainer.innerHTML = `
      <div class="card">
        <img src="${p.image}" />
        <h3>${p.name}, ${p.age} — ${percent}% Match</h3>
        <p><strong>Pronouns:</strong> ${p.pronouns}</p>
        <p><strong>Identity:</strong> ${p.identity}</p>
        <p>${p.bio}</p>
        <button onclick="startChat('${p.username}')">💬 Chat</button>
      </div>
    `;
  }

  document.getElementById("like").onclick = () => {
    if (index < others.length) {
      user.likes.push(others[index].username);
      users[currentUser] = user;
      localStorage.setItem("users", JSON.stringify(users));
      index++;
      showProfile(index);
    }
  };

  document.getElementById("pass").onclick = () => {
    if (index < others.length) {
      index++;
      showProfile(index);
    }
  };

  // Restart Matches Button
  const restartBtn = document.createElement("button");
  restartBtn.textContent = "🔄 Restart Matches";
  restartBtn.style.marginTop = "10px";
  restartBtn.onclick = () => {
    index = 0;
    showProfile(index);
  };
  document.querySelector(".buttons").appendChild(restartBtn);

  showProfile(index);

  // === CHAT SYSTEM ===
  window.startChat = function (targetUser) {
    document.getElementById("chat-box").style.display = "block";
    document.getElementById("chatUser").innerText = targetUser;
  };
}
