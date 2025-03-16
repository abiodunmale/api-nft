import express from "express";
import bodyParser from "body-parser";
import nftRouter from './routes/nft.js';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(express.static('nft')); 
app.use('/images', express.static('images'));
app.use(cors());

app.use('/nft', nftRouter);

app.listen(process.env.PORT || 3000, function() {
    console.log("Server running on port 3000");
})