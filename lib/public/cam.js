$(function() {
	var socket = io('/', { path: '/cam/socket.io/' })
	var $cam = $('#cam')

	socket.on('camfeed', function(data) {
		$cam.attr('src', 'data:image/jpg;base64,' + data.image)
	})
})