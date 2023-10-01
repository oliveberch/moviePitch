import { process } from "./env.js";
import { Configuration, OPENAIApi } from "/node_modules/openai";

const movieBossText = document.getElementById("movie-boss-text");
const setupInputContainer = document.getElementById("setup-input-container");

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});

const openAi = new OPENAIApi(configuration);

document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById("setup-textarea");
  if (setupTextarea.value) {
    const outline = setupTextarea.value;
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`;
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`;
    fetchReply(outline);
    fetchSynopsis(outline);
  }
});

async function fetchReply(outline) {
  const response = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a reply to process instruction for a minute based on outline.
    ###
    outline:
    reply:
    ###
    outline:"${outline}"
    reply:
    `,
    max_tokens: 60,
  });
  movieBossText.innerText = response.data.choices[0].text.trim();
}

async function fetchSynopsis(outline) {
  const response = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a professional and engaging movie synopsis based on plot."
    ###
    plot: 
    synopsis:
    ###
    plot: 
    synopsis: `,
    max_tokens: 60,
  });
  const synopsis = response.data.choices[0].text.trim();
  document.getElementById("output-text").innerText = synopsis;
  fetchTitle(synopsis);
  fetchCast(synopsis);
}

async function fetchTitle(synopsis) {
  const response = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate a movie title based on it's synopsis.
    ###
    synopsis: 
    title:
    ###
    synopsis:"${synopsis}"
    title: `,
    max_tokens: 20,
  });
  const title = response.data.choices[0].text.trim();
  document.getElementById("output-title").innerText = title;
  fetchPoster(title, synopsis);
  console.log(response);
}

async function fetchCast(synopsis) {
  const response = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt: `Return star cast mentioned in synopsis in brachets. Synopsis: "${synopsis}"`,
    max_tokens: 20,
  });
  document.getElementById("output-stars").innerText =
    response.data.choices[0].text.trim();
  console.log(response);
}

async function fetchPosterPrompt(title, synopsis) {
  const response = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt: `Return a descriptive prompt to generate poster in url for a movie based on titlr and synopsis.
    ###

    ###
    
    title: "${title}" and synopsis: ${synopsis}"`,
    max_tokens: 100,
  });
  return response;
}

async function fetchPoster(title, synopsis) {
  const prompt = fetchPosterPrompt(title, synopsis);
  const response = await openAi.createImage({
    prompt: ` "${prompt}}" There should be no text in this image.`,
    size: "256x256",
    response_format: "url",
  });
  document.getElementById(
    "output-img-container"
  ).innnerHTML = `<img src="${response.data.data[0].url}">`;
  // Setting up view pitch button
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`;
  document.getElementById("view-pitch-btn").addEventListener("click", () => {
    document.getElementById("setup-container").style.display = "none";
    document.getElementById("output-container").style.display = "flex";
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`;
  });
}
