"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show story form on click "submit" */

function navSubmitClick(evt) {
  console.debug("navSubmitClick");
  hidePageComponents();
  $allStoriesList.show();
  $storyForm.show();
}

$navSubmit.on("click", navSubmitClick);

/** Show favorites on click "favorites" */
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick");
  hidePageComponents();
  putUserFavoritesOnPage();
}

$navFavorites.on("click", navFavoritesClick);

/** Show user's submitted stories on click "my stories" */
function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick");
  hidePageComponents();
  putUserOwnStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);
