var fs = require('fs');
var path = require('path');

var image_path = __dirname + "/images"

var images = "";

var files = fs.readdirSync(image_path);
for (const file of files) {
    images += "-i '" + image_path + "/" + file + "' ";
}

fs.unlink("out.mp4",function (error){

});

var exec = require('child_process').exec;
exec("ffmpeg -f image2 -i images/file.mkv.sf-part%03d.png -s 720x359 -vcodec libx264 out.mp4", function callback(error, stdout, stderr) {
    console.log(error);
});

//ffmpeg -i output.mp4 -s 720x359 -vf fps=1 from_video/file.mkv.sf-part%04d.png

//ffmpeg -framerate 1/1 -i images/file%d.png -vf "fps=fps=5" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -vf scale=720:-2 output.mp4
