
function nextQuestion(current) {
    document.getElementById("q" + current).classList.remove("active");
    document.getElementById("q" + (current + 1)).classList.add("active");
}
const container = document.querySelector('.hearts-container');

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = 4 + Math.random() * 4 + 's';
    heart.style.opacity = Math.random();
    heart.style.transform = `scale(${Math.random() * 0.6 + 0.5}) rotate(45deg)`;

    container.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 8000);
}

setInterval(createHeart, 400);
