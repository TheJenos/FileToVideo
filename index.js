var fs = require('fs');
var path = require('path');
var splitFile = require('split-file');
var PImage = require('pureimage');
const cliProgress = require('cli-progress');
var Jimp = require('jimp');

var output_path = __dirname + "/output"
var image_path = __dirname + "/images"
var width_size = 720;
var parts = 1000;
var file_name = __dirname + "/file.mkv";
var size = 1;

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

var files = fs.readdirSync(output_path);
for (const file of files) {
    fs.unlinkSync(path.join(output_path, file), err => {
        if (err) throw err;
    });
}

var files1 = fs.readdirSync(image_path);
for (const file of files1) {
    fs.unlinkSync(path.join(image_path, file), err => {
        if (err) throw err;
    });
}

function getHexColor(number) {
    return "#" + ('000000' + ((number) >>> 0).toString(16)).slice(-6);
}


bar1.start(parts, 0);
var count_full = 0;
splitFile.splitFile(file_name, parts).then((names) => {
    var newpaths = [];
    names.forEach(element => {
        var path = element.split('/');
        var filename = path[path.length - 1];
        newpaths.push(filename);
        fs.renameSync(element, output_path + "/" + filename);
    });
    async function run() {
        width_size *= size;
        for (const element of newpaths) {
            var contents = fs.readFileSync(output_path + "/" + element, { encoding: null });
            // contents = element + "??File_Name??" + contents;
            var rows = contents.length % (width_size / size) > 0 ? Math.round(contents.length / (width_size / size)) + (1 / size) : contents.length / (width_size / size)

            var image = new Jimp(width_size, rows * size);
            var count = 0;
            for (var i = 0; i < (rows * size); i += size) {
                for (var j = 0; j < width_size; j += size) {
                    if (count < contents.length) {
                        image.setPixelColor(contents[count], j, i);
                    } else {
                        image.setPixelColor(Jimp.rgbaToInt(...[255, 255, 255, 255]), j, i);
                    }
                    count++;
                }
            }
            await image.write(image_path + "/" + element);

            // var img1 = PImage.make(width_size, rows * size);
            // var c = img1.getContext('2d');
            // c.fillStyle = "#FFFFFF";
            // c.fillRect(0, 0, img1.width, img1.height);
            // var count = 0;
            // for (var i = 0; i < img1.height; i += size) {
            //     for (var j = 0; j < img1.width; j += size) {
            //         if (count == contents.length) break;
            //         c.fillStyle = getHexColor(contents[count]);
            //         c.fillRect(j, i, size, size);
            //         count++;
            //     }
            // }
            // var stream = fs.createWriteStream(image_path + "/" + element);
            // await PImage.encodePNGToStream(img1, stream);
            // stream.destroy();

            count_full++;
            bar1.update(count_full);
        }
        bar1.stop();
    }
    run();
}).catch((err) => {
    console.log('Error: ', err);
});