import FavModel from "../../../DB/models/fav.model.js";
import DoctorModel from "../../../DB/models/doctor.model.js";

export const getFavourite = async (req, res) => {
  try {
    const user_id = req.user._id;
    const favourites = await FavModel.find({ user_id }).populate({
      path: "doctor_id",
      select: "_id name specialty image rate price address start_time end_time",
    });

    const doctors = favourites.map((fav) => fav.doctor_id);
    const formattedDoctors = doctors.map((doctor) => {
      let parsedAddress = null;
      if (typeof doctor.address === "string") {
        try {
          parsedAddress = JSON.parse(doctor.address);
        } catch {
          parsedAddress = doctor.address;
        }
      } else if (
        typeof doctor.address === "object" &&
        doctor.address !== null
      ) {
        parsedAddress = doctor.address;
      }

      const docObj = doctor.toObject ? doctor.toObject() : doctor;
      return {
        ...docObj,
        id: docObj._id ? docObj._id.toString() : docObj.id,
        address: parsedAddress,
      };
    });

    res.status(200).json(formattedDoctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get favourites", error: error.message });
  }
};

export const addFavourite = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const user_id = req.user._id;
    if (!doctor_id) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const doctor = await DoctorModel.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const existing = await FavModel.findOne({ user_id, doctor_id });
    if (existing) {
      return res.status(400).json({ message: "Doctor already in favourites" });
    }

    await FavModel.create({ user_id, doctor_id });
    res.status(201).json({ message: "Added to favourites" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add favourite", error: error.message });
  }
};

export const deleteFavourite = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { doctor_id } = req.params;
    if (!doctor_id) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const fav = await FavModel.findOne({ user_id, doctor_id });
    if (!fav) {
      return res.status(404).json({ message: "Favourite not found" });
    }

    await FavModel.findByIdAndDelete(fav._id);
    res.status(200).json({ message: "Removed from favourites" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete favourite", error: error.message });
  }
};
