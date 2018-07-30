var who_qas = [
    {q: "Hvem kan godt lide honning?", a: "Peter Plys"},
    {q: "Hvem hopper på sin hale?", a: "Tigerdyret"},
    {q: "Hvem taber sin hale?", a: "Æslet"},
    {q: "Hvem bor nede i havet?", a: "Ponyo"},
    {q: "Hvem kan godt lide skinke?", a: "Ponyo"},
    {q: "Hvem er sjov og fuld af spjæt?", a: "Bing-Bong"},
    {q: "Hvem kan flyve på en kost?", a: "Kiki"},
    {q: "Hvem kan flyve en flyvemaskine?", a: "Sus"},
    {q: "Hvem bygger et fyrtårn?", a: "Mimbo Jimbo"},
    {q: "Hvem har en frugt-butik?", a: "Frede"},
    {q: "Hvem har en dobbelt-zeppeliner?", a: "Baron von Rumpel-Stumpel"},
    {q: "Hvem spiser spaghetti med kødboller?", a: "Lady og Vagabonden"},
    {q: "Hvem bor i en paddehat?", a: "Smølf"},
    {q: "Hvem sover på Totoros mave?", a: "Mei"},
    {q: "Hvem kan flyve med sine ører?", a: "Dumbo"},
    {q: "Hvem sår korn?", a: "Den lille røde høne"},
];

QUIZ_TYPES = {
    hvem: {
        descr: "Hvem...?",
        title: "Opgaver med “hvem”",
        tags: ["Dansk", "Spørgsmål", "Hvem"],
        qa_gen: function(config) {
            return rand_from_list(who_qas);
        }
    }
}
