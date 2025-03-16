import fs from 'fs';
import canvas from 'canvas';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import fetch from "node-fetch";

// Basic Parameters
const projectName = 'A sick story';
const projectDescription = 'A sick nft, prop nothing';

const imageSize = {
  width: 512,
  height: 512,
};

const dir = {
  input : `./layers`,
  output: `./nft`,
}

let users = [
    {
        name: "jhon",
        age: 20,
        id: 1
    },
    {
        name: "same",
        age: 27,
        id: 2
    },
    {
        name: "favs",
        age: 100,
        id: 3
    }
]

const addLayer = async (traitType,val,ctx) => {
    const img = await canvas.loadImage(`${dir.input}/${traitType}/${val}.png`);
    ctx.drawImage(img,0,0,imageSize.width,imageSize.height);
    ctx.attributes.push({ 'trait_type': traitType, 'value': val });
};
  
const recreateOutputsDir = () => {
    if (!fs.existsSync(dir.output)){
        fs.mkdirSync(dir.output);
        fs.mkdirSync(`${dir.output}/metadata`);
        fs.mkdirSync(`${dir.output}/hdimages`);
    }
};

export const about = async (req, res) => {
    res.json({
        message: "a sample nft generate api",
        info: "to generate an nft using the below layers use url /generate (POST request), sample body request below",
        sample:  {
            Backgrounds: "Background3",
            Characters: "James",
            Eyes: "Green",
            Mouth: "Smoking"
        },
        layers : [
            {
                traitType : "Backgrounds",
                value: ["Background1", "Background2", "Background3"]
            },
            {
                traitType : "Characters",
                value: ["Jack", "James", "Jill"]
            },
            {
                traitType : "Eyes",
                value: ["Blue", "Brown", "Green"]
            },
            {
                traitType : "Mouths",
                value: ["Happy", "Sad", "Smoking"]
            }
        ]
    });
};

export const generateNft = async (req, res) => {


    const { nftID, Arm_Ring, Background, Body, Body_Piece, Bracer, Eyes, Headpiece, Necklace, Rune, Tattoos  } = req.body;

    if (!nftID || !Arm_Ring || !Background || !Body || !Body_Piece || !Bracer || !Eyes || !Headpiece || !Necklace || !Rune || !Tattoos) {
        res.status(400).json({error: true, message: 'missing layers'});
        return;
    }

    // recreateOutputsDir();


    const blankCanvas = canvas.createCanvas(imageSize.width, imageSize.height);
    const ctx = blankCanvas.getContext("2d");
    ctx.attributes = [];

    /* Add layers using addLayer(dir,file,ctx) function below */
    const layers = []
    layers.push(addLayer('Arm Ring', Arm_Ring, ctx));
    const AuraArray = ['Chain Lightning','Dragonflame','Purple Lightning','Rainbow','Thundercharge'];
    let aura = AuraArray[Math.floor(Math.random()*AuraArray.length)];
    layers.push(addLayer('Aura', aura, ctx));

    layers.push(addLayer('Background', Background, ctx));
    layers.push(addLayer('Body', Body, ctx));
    layers.push(addLayer('Body Piece', Body_Piece, ctx));
    layers.push(addLayer('Bracer', Bracer, ctx));
    layers.push(addLayer('Eyes', Eyes, ctx));
    layers.push(addLayer('Headpiece', Headpiece, ctx));
    layers.push(addLayer('Necklace', Necklace, ctx));
    layers.push(addLayer('Rune', Rune, ctx));
    layers.push(addLayer('Tattoos', Tattoos, ctx));

    const WeaponArray = ['Bloodred Battleaxe','Blue Hilt Spear','Emerald Battleaxe','Flame Bow','Green Hilt Spear','Gungnir','Longsword','Mjolnir','Nature Bow','Night Bow','Red Hilt Spear','Royal Bow','Sea Battleaxe','Silver Red Hilt Spear','Soul Reaper','Venomous Blade'];
    let weapon = WeaponArray[Math.floor(Math.random()*WeaponArray.length)];
    layers.push(addLayer('Weapon', weapon, ctx));

    const WingsArray = ['Aged Commander','Angel','Ascended Angel','Fallen Angel','Full Silver Commander','Future','Glory','Gold Commander','Green Gold Commander','Green Silver Commander','Nano','Royal Gold Commander','Royal Silver Commander','Tattered','Valor'];
    let wings = WingsArray[Math.floor(Math.random()*WingsArray.length)];
    layers.push(addLayer('Wings', wings, ctx));
    await Promise.all(layers)
    /* End of layers code */

    // save metadata
    // fs.writeFileSync(`${dir.output}/metadata/${nftID}.json`, (err) =>  { if (err) throw err });

    const headerOption = {
        headers: {
            AccessKey: '911c877d-6f91-4a20-a1448cec7cca-6a41-48d5',
            'content-type': 'application/octet-stream'
        }
    };

    const optionsImage = {
        method: 'PUT',
        ...headerOption,
        body: blankCanvas.toBuffer('image/png')
    };

    const resultImage = await fetch(`https://storage.bunnycdn.com/nft-artt/${nftID}.png`, optionsImage);
    if(resultImage.status >= 400){
        return res.status(404).send('Bad response from server, image');
    }

    let metadata = JSON.stringify({
        name: `${projectName} #${nftID}`,
        description: projectDescription,
        image: `https://a-sick-storyy.b-cdn.net/${nftID}.png`,
        //external_url: projectURL,
        attributes: ctx.attributes,
    }, null, 2)

    // save image 
    const optionsMetadata = {
        method: 'PUT',
        ...headerOption,
        body: metadata
    };
      
    const resultMetadata = await fetch(`https://storage.bunnycdn.com/nft-artt/metadata/${nftID}.json`, optionsMetadata);
    if(resultMetadata.status >= 400){
        return res.status(404).send('Bad response from server, metadata');
    }

    
    // fs.writeFileSync(`${dir.output}/hdimages/${nftID}.png`, blankCanvas.toBuffer('image/png'));
    // await imagemin([`${dir.output}/hdimages/${nftID}.png`], {
    //     destination: `${dir.output}/images/`,
    //     plugins: [imageminPngquant({quality: [0.5, 0.6]})]
    // });

    // return res.json(blankCanvas.toDataURL('image/png'));

    res.status(200).json({
        message: `nft revealed!!`, 
        tokenId: nftID,
        metadata: `${req.protocol}://${req.get('host')}/nft/metadata/${nftID}`
    });
};

export const getNftMetadata = async (req, res) => {
    let tokenId = req.params.id;
    tokenId = tokenId.replace(/\D/g,'');

    // let nftID = fs.readdirSync(`${dir.output}/metadata`).length;
    // if(Number(tokenId) > nftID){
    //     res.status(404).json({
    //         error: true, 
    //         message: "Token id does not exist",
    //         tokenId
    //     });
    //     return;
    // }



    // var fileContents;
    // try {
    //     fileContents = JSON.parse(fs.readFileSync(`${dir.output}/metadata/${tokenId}.json`, 'utf8'));
    // } catch (err) {
    //     res.status(404).json({
    //         error: true, 
    //         message: "Token id does not exist",
    //         tokenId
    //     });
    // }
    // res.json(fileContents);

    // try {
        const result = await fetch(`https://a-sick-storyy.b-cdn.net/metadata/${tokenId}.json`);
    
        if (result.status >= 400) {
            return res.status(404).send('Bad response from server');
        }
    
        const data = await result.json();
        return res.json(data);
};

export const deleteNft = async (req, res) => {
    const userId = req.params.id;

    users = users.filter(function(user) {
        return user.id.toString() !== userId;
    })

    res.json(users);
};

export const updateNft = async (req, res) => {
    const userId = req.params.id;
    const { name , age } = req.body;

    users = users.map(function(user){
        if(user.id.toString() == userId){
            return{
                name,
                age,
                id : Number(userId)
            }
        }

        return user;
    })

    res.json(users);
};