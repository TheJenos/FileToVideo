var fs = require('fs');
var path = require('path');
var Jimp = require('jimp');
var splitFile = require('split-file');
const cliProgress = require('cli-progress');

var output = __dirname + "/output"
var output_path = __dirname + "/from_images"
var image_path = __dirname + "/images"

var parts = 1000;
var size = 1;

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

var files = fs.readdirSync(output_path);
for (const file of files) {
    fs.unlinkSync(path.join(output_path, file), err => {
        if (err) throw err;
    });
}

async function run() {
    var files = fs.readdirSync(image_path);
    var count_full = 0;
    var file_list = [];
    for (const file of files) {
        var image = await Jimp.read(image_path + "/" + file);
        image.resize(image.getWidth() * 10, image.getHeight() * 10);
        var contents = [];
        var count = 0;
        for (var i = 0; i < image.getHeight(); i += size) {
            for (var j = 0; j < image.getWidth(); j += size) {

                // var color_obj = Jimp.intToRGBA(image.getPixelColor(j, i));
                // var color_int = (color_obj.r * 256 * 256) + (color_obj.g * 256) + color_obj.b;
                // if (color_int == 16777215) break;

                var color_int = image.getPixelColor(j, i);
                if (color_int == 4294967295) break;

                contents.push(color_int);
                count++;
            }
        }

        var read_file = fs.readFileSync(output + "/" + file, { encoding: null });
        var loss_count = 0;
        for (let index = 0; index < read_file.length; index++) {
            if (read_file[index] != contents[index]) {
                loss_count++;
            }
        }

        if (loss_count > 1) {
            console.log();
            console.log();
            console.log(loss_count + "," + read_file.length + "-" + (loss_count / read_file.length * 100) + "%");
            process.exit(0);
        }

        fs.writeFileSync(output_path + "/" + file, new Buffer(contents), { encoding: null });
        file_list.push(output_path + "/" + file);
        count_full++;
        bar1.update(count_full);
    }
    splitFile.mergeFiles(file_list, __dirname + "/output.mkv").then(() => {
        console.log('Done!');
    }).catch((err) => {
        console.log('Error: ', err);
    });
    bar1.stop();
    console.log("Test is done");
}

run();

