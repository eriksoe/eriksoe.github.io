var who_qas = [
    {q: "Hvem kan godt lide honning?", a: "Peter Plys"},
    {q: "Hvem hopper på sin hale?", a: "Tigerdyret"},
    {q: "Hvem taber sin hale?", a: "Æslet"},
    {q: "Hvem bor nede i havet?", a: "Ponyo"},
    {q: "Hvem kan godt lide skinke?", a: "Ponyo"},
    {q: "Hvem er sjov og fuld af spjæt?", a: "Bing-Bong"},
    {q: "Hvem kan flyve på en kost?", a: "Kiki"},
    //{q: "Hvem kan flyve en flyvemaskine?", a: "Sus"},

    {q: "Hvem bygger et fyrtårn?", a: "Mimbo Jimbo"},
    {q: "Hvem har en frugt-butik?", a: "Frede"},
    {q: "Hvem har en dobbelt-zeppeliner?", a: "Baron von Rumpel-Stumpel"},
    {q: "Hvem læser en bog om Baron von Rumpel-Stumpel?", a: "Post-geparden"},

    {q: "Hvem spiser spaghetti med kødboller?", a: "Lady og Vagabonden"},
    {q: "Hvem bor i en paddehat?", a: "Smølf"},
    {q: "Hvem sover på Totoros mave?", a: "Mei"},
    {q: "Hvem kan flyve med sine ører?", a: "Dumbo"},
    {q: "Hvem sår korn?", a: "Den lille røde høne"},

    {q: "Hvem har en grøn hat og kan flyve?", a: "Peter Pan"},
    {q: "Hvem er lille og lyser og kan flyve?", a: "Klokkeblomst"},
    {q: "Hvem har et sort skæg?", a: "Kaptajn Klo"},

    {q: "Hvem har et sort skæg?", a: "Hr. Skæg"},

    {q: "Hvem er Theodors storesøster?", a: "Johanne"},
    {q: "Hvem er Theodors lillebror?", a: "Alfred"},
    {q: "Hvem har røde briller?", a: "Johanne"},

    {q: "Hvem bor i Ry?", a: "Farfar"},
    {q: "Hvem bor i Ry?", a: "Farmor"},
    {q: "Hvem bor i Hammel?", a: "Milo"},
    {q: "Hvem bor i Hammel?", a: "Frej"},
    {q: "Hvem bor i Odder?", a: "Jacob"},
    {q: "Hvem bor i Odder?", a: "Sarah"},
    /*
    {q: "Hvem bor i Skanderborg?", a: "Johanne"},
    {q: "Hvem bor i Skanderborg?", a: "Theodor"},
    */
];

var who_says_qas = [
    {q: "Vildt nok", a: "Giraffen"},
    {q: "", a: ""},
];

var where_qas = [
    {q: "Hvor bor Totoro?", a: "I et træ"},
    {q: "Hvor bor Peter Plys?", a: "I et træ"},
    {q: "Hvor skal den store pære være?", a: "I toppen af fyrtårnet"},
    {q: "Hvor bor Ninka Ninus?", a: "I et hul i jorden"},
    {q: "Hvor bor Farfar og Farmor?", a: "I Ry"},
    {q: "Hvor bor Karina og Niels?", a: "I Hurup"},
    {q: "Hvor bor Jacob og Sarah?", a: "I Odder"},
    {q: "Hvor bor Milo og Frej?", a: "I Hammel"},
    {q: "Hvor er smørret?", a: "I køleskabet"},
    {q: "Hvor er havregrynene?", a: "I skabet"},
    {q: "Hvor er tallerkenerne?", a: "I skabet"},
    {q: "Hvor er gaflerne?", a: "I skuffen"},
    {q: "Hvor er skeerne?", a: "I skuffen"},
    {q: "Hvor er din mund?", a: "Under min næse"},
    {q: "Hvor bor en fugl?", a: "I en rede"},
    {q: "Hvor kommer mælken fra?", a: "Fra en ko"},
    {q: "Hvor kommer æggene fra?", a: "Fra en høne"},
];

QUIZ_TYPES = {
    hvem: {
        descr: "Hvem...?",
        title: "Opgaver med “hvem”",
        tags: ["Dansk", "Spørgsmål", "Hvem"],
        qa_gen: function(config) {
            return rand_from_list(who_qas);
        }
    },
    hvor: {
        descr: "Hvor...?",
        title: "Opgaver med “hvor”",
        tags: ["Dansk", "Spørgsmål", "Hvor"],
        qa_gen: function(config) {
            return rand_from_list(where_qas);
        }
    },

    plus: {
        descr: "Plus-opgaver",
        title: "Plus-opgaver",
        tags: ["Matematik", "Plus"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 1, max = 50;
            var a = rand_int(min, max);
            var b = rand_int(min, max);
            var r = a + b;
            if (r>max) return null;
            return {q: a+" + " + b, a: ""+r};
        }
    },

    gange: {
        descr: "Gange-opgaver",
        title: "Gange-opgaver",
        tags: ["Matematik", "Gange"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 0, max = 10;
            var a = rand_int(min, max);
            var b = rand_int(min, max);
            var r = a * b;
            return {q: a + "&nbsp;&middot;&nbsp;" + b, a: ""+r};
        }
    },
}
