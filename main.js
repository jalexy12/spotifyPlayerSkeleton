$(document).on("ready", function(){
	$(".js-track-submit").on("click", searchForTrack);
	$(".btn-play").on("click", togglePlaying);
	$(".track-player").on("timeupdate", updateProgressBar);
	$(".track-player").on("ended", resetPlayer);
	$(".author").on("click", showArtistInfo);
	$(".more").on("click", function(){
		if ($(".js-previous-track-item").length > 0){
			$(".previous-tracks").modal("show");
		}
	})
})

function addInfoToPreviousTracksModal(trackResponse){
	trackResponse.tracks.items.forEach(function(track){
		var html = `
			<li class="js-previous-track-item">
				<a href="#" data-track-id=${track.id} class="js-prev-track-link">
					${track.name}
				</a>
			</li>
		`
		$(".js-previous-tracklist").append(html);
	})

	$(".js-prev-track-link").on("click", function(event){
		var trackId = $(event.currentTarget).data("track-id");
		loadOldTrack(trackId);
	})
}

function loadOldTrack(trackId){
	$.ajax({
		url: `https://api.spotify.com/v1/tracks/${trackId}`, 
		success: onPrevTrackLoad,
		error: onPrevTrackError
	})
}

function onPrevTrackLoad(singleTrack){
	addTrackToPlayer(singleTrack);
	$(".previous-tracks").modal("hide");
}

function onPrevTrackError(err){
	console.log(err);
}

function showArtistInfo(){
	var artistId = $(".author").data("artist-id");
	$.ajax({
		url: `https://api.spotify.com/v1/artists/${artistId}`,
		success: showArtistModal,
		error: showArtistError
	})
}

function showArtistModal(response){
	$(".js-artist-name").text(response.name);
	$(".modal-artist-image").prop("src", response.images[0].url)
	$(".artist-modal").modal("show");
}

function showArtistError(err){
	alert("Something went wrong");
	console.log(err);
}

function resetPlayer(){
	$(".btn-play").removeClass("playing");
	$(".js-track-progress").val(0);
}

function updateProgressBar(){
	var currentTime = $(".track-player").prop("currentTime");
	console.log(currentTime);
	$(".js-track-progress").val(currentTime);
}

function searchForTrack(){
	var trackInput = $(".js-track-input").val();
	$.ajax({
		url: `https://api.spotify.com/v1/search?type=track&q=${trackInput}`,
		success: onTrackSuccess,
		error: onTrackError,
	})
	$(".js-track-input").val("");
}


function onTrackSuccess(trackResponse){
	addInfoToPreviousTracksModal(trackResponse);
	var firstTrack = trackResponse.tracks.items[0];
	if (firstTrack === undefined){
		alert("No tracks by that name!");
		return;
	}

	addTrackToPlayer(firstTrack);
}

function addTrackToPlayer(track){
	$(".btn-play").removeClass("disabled");
	$(".title").text(track.name);
	$(".author").text(track.artists[0].name);
	$(".artist-image").prop("src", track.album.images[0].url);
	$(".track-player").prop("src", track.preview_url);
	$(".author").data("artist-id", track.artists[0].id);
}

function onTrackError(err){
	alert("Something went wrong");
	console.log(err);
}

function togglePlaying(){
	var playButton = $(".btn-play");
	if (playButton.hasClass("playing")){
		playButton.removeClass("playing");
		$(".track-player").trigger("pause");
	} else {
		playButton.addClass("playing");
		$(".track-player").trigger("play");
	}
}