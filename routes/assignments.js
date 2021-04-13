// Assignment est le "modèle mongoose", il est connecté à la base de données
let Assignment = require("../model/assignment");

/* Version sans pagination */
// Récupérer tous les assignments (GET)
/*
function getAssignments(req, res){
    Assignment.find((err, assignments) => {
        if(err){
            res.send(err)
        }

        res.send(assignments);
    });
}
*/
let express = require('express');
const router = express.Router();

// Récupérer tous les assignments (GET), AVEC PAGINATION
/*app.route('/assignments')
    .get(getAssignments);

app.route('/assignments/:id')
    .get(getAssignment)
    .delete(deleteAssignment);


app.route('/assignments')
    .post(postAssignment)
    .put(updateAssignment);*/
router.get('/assignments', getAssignments);
router.get('/assignments/:id', getAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.post('/assignments', postAssignment);
router.put('/assignments', updateAssignment);

function getAssignments(req, res) {

    let aggregate_options = [];
    let auteur = !!(req.query.auteur);
    let rendu = !!(req.query.rendu);
    let matiere = !!(req.query.matiere);
    let auteur_regex = {$regex: req.query.auteur, $options: 'i'};
    if (auteur) {
        console.log(req.query.auteur);
        aggregate_options.push({$match: {auteur: auteur_regex}});
    }
    if (rendu) {
        if (req.query.rendu == 1) {
            aggregate_options.push({$match: {rendu: true}});
        } else if (req.query.rendu == 2) {
            aggregate_options.push({$match: {rendu: false}});
        }
    }
    if (matiere) {
        aggregate_options.push({$match: {matiere: req.query.matiere}});
    }
    var aggregateQuery = Assignment.aggregate(aggregate_options);
    console.log(JSON.stringify(aggregate_options));
    Assignment.aggregatePaginate(
        aggregateQuery,
        {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
        },
        (err, assignments) => {
            if (err) {
                res.send(err);
            }
            res.send(assignments);
        }
    );
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res) {
    let assignmentId = req.params.id;

    Assignment.findOne({id: assignmentId}, (err, assignment) => {
        if (err) {
            res.send(err);
        }
        res.json(assignment);
    });
}


// Ajout d'un assignment (POST)
function postAssignment(req, res) {
    let assignment = new Assignment();
    assignment.id = req.body.id;
    assignment.nom = req.body.nom;
    assignment.dateDeRendu = req.body.dateDeRendu;
    assignment.rendu = req.body.rendu;
    assignment.auteur = req.body.auteur;
    assignment.matiere = req.body.matiere;
    assignment.matiereimage = req.body.matiereimage;
    assignment.image = req.body.image;
    assignment.note = req.body.note;
    assignment.remarques = req.body.remarques;

    console.log("POST assignment reçu :");
    console.log(assignment);

    assignment.save((err) => {
        if (err) {

            res.send("cant post assignment ", err);
        }
        res.json({message: `${assignment.nom} saved!`});
    });
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);
    Assignment.findByIdAndUpdate(
        req.body._id,
        req.body,
        {new: true},
        (err, assignment) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json({message: "updated"});
            }

            // console.log('updated ', assignment)
        }
    );
}

// suppression d'un assignment (DELETE)
function deleteAssignment(req, res) {
    Assignment.findByIdAndRemove(req.params.id, (err, assignment) => {
        if (err) {
            res.send(err);
        }
        res.json({message: `${assignment.nom} deleted`});
    });
}

module.exports = router;
