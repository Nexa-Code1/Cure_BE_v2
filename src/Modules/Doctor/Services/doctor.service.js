import DoctorModel from "../../../DB/models/doctor.model.js";
import ReviewModel from "../../../DB/models/reviews.model.js";
import UserModel from "../../../DB/models/user.model.js";
import FavModel from "../../../DB/models/fav.model.js";

// Function to calculate average rating from reviews for a doctor
const calculateDoctorRate = async (doctorId) => {
    try {
        const reviews = await ReviewModel.find({ doctor_id: doctorId }).select('rate');
        if (reviews.length === 0) {
            return 0; // No reviews yet
        }

        const totalRate = reviews.reduce((sum, review) => sum + review.rate, 0);
        const averageRate = totalRate / reviews.length;

        // Round to 1 decimal place
        return Math.round(averageRate * 10) / 10;
    } catch (error) {
        console.error('Error calculating doctor rate:', error);
        return 0;
    }
};

// Function to attach calculated rates to doctors
const attachCalculatedRates = async (doctors) => {
    if (!doctors || doctors.length === 0) return doctors;

    const doctorsWithRates = await Promise.all(
        doctors.map(async (doctor) => {
            const calculatedRate = await calculateDoctorRate(doctor._id);
            return {
                ...doctor,
                rate: calculatedRate
            };
        })
    );

    return doctorsWithRates;
};

export const addDoctor = async (req, res) => {
    try {
        let {
            name,
            about,
            specialty,
            start_time,
            end_time,
            available_slots,
            address,
            price,
            experience,
            email,
            patients,
            gender,
        } = req.body;

        const image = req.file?.path || req.body.image;

        // Check if email already exists
        const isExist = await DoctorModel.findOne({ email });
        if (isExist) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Parse JSON strings (from form-data)
        if (typeof available_slots === "string") {
            available_slots = JSON.parse(available_slots);
        }
        if (typeof address === "string") {
            address = JSON.parse(address);
        }

        // Validate slot dates
        const todayMidnight = new Date().setHours(0, 0, 0, 0);
        for (const item of available_slots) {
            const dayDate = new Date(item.day);
            if (dayDate < todayMidnight) {
                return res.status(400).json({
                    message: `Invalid day: ${item.day} — cannot add past days.`,
                });
            }
        }

        // Create doctor
        const doctor = await DoctorModel.create({
            name,
            about,
            specialty,
            start_time,
            end_time,
            available_slots,
            address,
            price,
            image,
            experience,
            email,
            patients,
            gender,
        });

        res.status(201).json({
            message: "Doctor added successfully",
            doctor,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add doctor",
            error: error.message,
        });
    }
};

const attachFavourites = async (doctors, user_id) => {
    if (!user_id)
        return doctors.map((d) => ({ ...d.toObject(), is_favourite: false }));

    const favs = await FavModel.find({ user_id }).select("doctor_id");
    const favIds = favs.map((f) => f.doctor_id.toString());

    return doctors.map((doctor) => {
        const d = doctor.toObject ? doctor.toObject() : doctor;
        d.id = d._id ? d._id.toString() : d.id;
        d.is_favourite = favIds.includes(d.id);

        if (typeof d.address === "string") {
            try {
                d.address = JSON.parse(d.address);
            } catch {
                d.address = null;
            }
        }

        if (
            doctor.available_slots &&
            typeof doctor.available_slots === "string"
        ) {
            try {
                d.available_slots = JSON.parse(doctor.available_slots);
            } catch {
                d.available_slots = [];
            }
        }

        return d;
    });
};

export const getDoctors = async (req, res) => {
    try {
        const {
            limit = 10,
            offset = 0,
            doctorName = "",
            sort = "",
            gender,
            available,
            specialty,
        } = req.query;

        const availableDays = available
            ? available.split(",").map((d) => d.trim())
            : [];

        const specialities = specialty
            ? specialty.split(",").map((d) => d.trim())
            : [];

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const formattedToday = today.toISOString().split("T")[0];
        const formattedTomorrow = tomorrow.toISOString().split("T")[0];

        const whereConditions = {};
        if (doctorName) whereConditions.name = { $regex: doctorName, $options: "i" };
        if (gender) whereConditions.gender = gender;
        if (specialities.length > 0)
            whereConditions.specialty = { $in: specialities };

        if (availableDays.length > 0) {
            const jsonConditions = availableDays.map((day) => {
                const formattedDate =
                    day === "tomorrow" ? formattedTomorrow : formattedToday;
                return {
                    available_slots: {
                        $elemMatch: {
                            day: formattedDate,
                        },
                    },
                };
            });
            whereConditions.$or = jsonConditions;
        }

        let sortOptions = {};
        if (sort === "price_asc") sortOptions = { price: 1 };
        else if (sort === "price_desc") sortOptions = { price: -1 };
        else if (sort === "recommend") {
            sortOptions = { rate: -1 };
            whereConditions.rate = { $gte: 3 };
        }

        const doctors = await DoctorModel.find(whereConditions)
            .select("_id name specialty start_time end_time price image address gender available_slots")
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();

        const count = await DoctorModel.countDocuments(whereConditions);

        // Calculate rates from reviews and attach favourites
        const doctorsWithCalculatedRates = await attachCalculatedRates(doctors);

        // Apply rate filter after calculating rates (for recommend sort)
        let filteredDoctors = doctorsWithCalculatedRates;
        if (sort === "recommend") {
            filteredDoctors = doctorsWithCalculatedRates.filter(doctor => doctor.rate >= 3);
        }

        const formattedDoctors = await attachFavourites(filteredDoctors, req.user?._id);

        res.status(200).json({
            message: "Doctors fetched successfully",
            count,
            doctors: formattedDoctors,
        });
    } catch (error) {
        console.error("Get Doctors Error:", error);
        res.status(500).json({
            message: "Failed to fetch doctors",
            error: error.message,
        });
    }
};

export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await DoctorModel.findById(id);

        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });

        // Get reviews separately
        const reviews = await ReviewModel.find({ doctor_id: id })
            .populate("user_id", "fullname image _id")
            .select("rate comment created_at updated_at")
            .lean();

        // Calculate current rate from reviews
        const calculatedRate = await calculateDoctorRate(id);

        const formattedReviews = reviews.map((review) => ({
            id: review._id.toString(),
            rate: review.rate,
            comment: review.comment,
            created_at: review.created_at,
            updated_at: review.updated_at,
            user: review.user_id
                ? {
                      id: review.user_id._id.toString(),
                      fullname: review.user_id.fullname,
                      image: review.user_id.image,
                  }
                : null,
        }));

        const formattedDoctorArray = await attachFavourites(
            [doctor],
            req.user?._id
        );
        const formattedDoctor = {
            ...formattedDoctorArray[0],
            rate: calculatedRate, // Override with calculated rate
            reviews: formattedReviews,
        };

        res.status(200).json({
            message: "Doctor fetched successfully",
            doctor: formattedDoctor,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch doctor",
            error: error.message,
        });
    }
};

export const getTopRatedDoctors = async (req, res) => {
    try {
        // Get all doctors first
        const doctors = await DoctorModel.find({})
            .select("_id name specialty start_time end_time price image address")
            .lean();

        if (!doctors || doctors.length === 0) {
            return res.status(200).json({
                message: "No doctors found",
                doctors: [],
            });
        }

        // Calculate rates and filter top rated doctors
        const doctorsWithCalculatedRates = await attachCalculatedRates(doctors);
        const topRatedDoctors = doctorsWithCalculatedRates.filter(doctor => doctor.rate >= 3);

        if (topRatedDoctors.length === 0) {
            return res.status(200).json({
                message: "No doctors found with rate >= 3",
                doctors: [],
            });
        }

        const formattedDoctors = await attachFavourites(topRatedDoctors, req.user?._id);

        res.status(200).json({
            message: "Doctors fetched successfully",
            doctors: formattedDoctors,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch doctors",
            error: error.message,
        });
    }
};
