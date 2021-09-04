"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
// show if the list is user's own stories. Changes to true in putUserOwnStoriesOnPage()
let ownStoriesList = false;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // show favorite stars if a user is logged in
  const showStars = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${ownStoriesList ? trashHTML(story, currentUser) : ""}
        ${showStars ? starHTML(story, currentUser) : ""}        
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** create "favorite" star */

function starHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `<span class="star">
            <i class="${starType} fa-star"></i>
          </span>`;
}

/** create trash can to remove stories */

function trashHTML(story, user) {
  return `<span class="trash">
            <i class="fa fa-trash"></i>
          </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  hidePageComponents();

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    // make sure trash can doesn't show
    ownStoriesList = false;

    const $story = generateStoryMarkup(story);

    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Get user favorites, generate HTML, display on page */

function putUserFavoritesOnPage() {
  console.debug("putUserFavoritesOnPage");
  hidePageComponents();

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("You have no favorite stories.")
  } else {
    for (let story of currentUser.favorites) {  
      for (let item of storyList.stories) {
        if (story.storyId === item.storyId) {
          // make sure trash can doesn't show for this list
          ownStoriesList = false;

          const $story = generateStoryMarkup(story);

          $favoritedStories.prepend($story);
        }
      } 
      
    }
  }
  $favoritedStories.show();
}

function putUserOwnStoriesOnPage() {
  console.debug("putUserOwnStoriesOnPage");
  hidePageComponents();

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("You have not submitted any stories.")
  } else {
    for (let story of storyList.stories) {
      if (story.username === currentUser.username) {
        // show trash can for this list
        ownStoriesList = true;

        const $story = generateStoryMarkup(story);
        $ownStories.prepend($story);
      }     
    }
  }
  $ownStories.show();
}


/** Called when user submits story form.
 *  Get data from storyForm, call addStory, and put that story on the page */

async function handleStorySubmit(evt) {
  console.debug("handleStorySubmit");
  evt.preventDefault();
  // get form input data
  const title = $('#title-input').val();
  const author = $('#author-input').val();
  const url = $('#url-input').val();
  // get user info
  const username = currentUser.username;
  // create story object
  const storyObj = {username, title, author, url};

  const story = await storyList.addStory(currentUser, storyObj);
  const newStoryMarkup = generateStoryMarkup(story);
  $allStoriesList.prepend(newStoryMarkup);
  $ownStories.prepend(newStoryMarkup);
  $storyForm.hide();
  putStoriesOnPage();
}

$storyForm.on("submit", handleStorySubmit);

/** Toggle star style for a story and add to/remove from favorites */
async function toggleFavorite(evt) {
  const $targetLi = $(evt.target).closest('li');
  const targetStoryId = $targetLi.attr('id');
  const targetStory = storyList.stories.find(item => item.storyId === targetStoryId);

  // if list item is already favorited ('fas' star)
  if ($(evt.target).hasClass("fas")) {
    // remove from  favorites list and change star style to 'far'
    await currentUser.removeFavorite(targetStory);
    $(evt.target).closest('i').toggleClass("fas far");
  } else {
    // add to favorites list and change star style to 'fas'
    await currentUser.addFavorite(targetStory);
    $(evt.target).closest('i').toggleClass("fas far");
  }
  
}

$storiesLists.on("click", ".star", toggleFavorite);

/** Delete story when user clicks trash icon */

async function removeOwnStory(evt) {
  const $targetLi = $(evt.target).closest('li');
  const targetStoryId = $targetLi.attr('id');
  const targetStory = storyList.stories.find(item => item.storyId === targetStoryId);

  // remove story from API
  await currentUser.removeStory(targetStory);

  // remove story from storyList
  const indexToRemove = storyList.stories.indexOf(targetStory);
  storyList.stories.splice(indexToRemove, 1);
  
  // remove story from DOM
  $targetLi.remove();
}

$storiesLists.on("click", ".trash", removeOwnStory);
