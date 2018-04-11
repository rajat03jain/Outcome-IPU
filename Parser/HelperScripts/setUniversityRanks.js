var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost/Result', function (err, db) {
	if (err) {
		console.log("Crashed at init:");
		console.log(err);
		process.exit();
	}
	db.collection("Student").aggregate([
		{ $match: { Examination: { $regex: /regular/gi } } },
		{ $group: {
			_id: { Examination: "$Examination", Semester: "$Semester", Programme: "$Programme", Batch: "$Batch" },
			Students: { $push: { Name: "$Name", EnrollmentNumber: "$EnrollmentNumber", Scores: "$Score" } },
		} },
		{ $unwind: "$Students" },
		{ $sort: { "Students.Scores": -1 } },
		{ $group: {
			_id: "$_id",
			Students: { $push: "$Students" },
			count: { $sum: 1 }
		} },
		{ $project: { 
			Students: 1,
			count: 1
		} },
		{ $out: "University" }
	]).toArray(function (err) {
		if (err) {
			console.log("Crashed at Aggregate:");
			console.log(err);
			db.close();
			process.exit();
		}
		console.log("Done.");
		db.close();
	});
});