import Window from "../models/quizWindowModel.js";

//get all products controller
const getWindows = async(req, res) => {
    try{
        const windows = await Window.find({});
        res.status(200).json(windows);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

//get one product controller
const getWindow = async(req,res) => {
    try{
        const {id} = req.params; //take id from url
        const window = await Window.findById(id)
        res.status(200).json(window);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

//add window controller
const createWindow = async(req,res) => {
    try{
        const window =  await Window.create(req.body);
        res.status(200).json(window);
    }catch(error){
        res.status(500).json({message: error.message});
    }

}

const windowController = {
  createWindow,
  getWindows,
  getWindow
};

export default windowController;