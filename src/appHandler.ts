import { config } from "./config/config";
import { Mapdata } from "./types/Mapdata.type";
import saveDataToFile from "./utils/saveDataToFile";
import type ZoneChecker from "./ZoneChecker";
import type EmailService from "./services/EmailService";
import { createHTMLMessageUsingTemplate } from "./utils/createHTMLMessageUsingTemplate";

export async function appHandler(checker: ZoneChecker, notifier: EmailService) {
    try {
        console.log("Fetching data...");
        const response = await fetch(config.eso_api_url);
        const data: Mapdata = await response.json();

        if (data.message) {
            console.log("Message from ESO api:", data.message);
        }

        if (!data.success) {
            console.error("Something whent wrong while fetching data.");
            return;
        }

        const listOfExistingCoordinates = data.data.map((item) => {
            return { lat: Number(item.lat), lng: Number(item.lng) };
        });

        const results = checker.checkPoints(listOfExistingCoordinates);

        let content = "<ol>";
        for (let item of results) {
            content += `<li>${JSON.stringify(item)}</li>`;
        }
        content += "</ol>";

        if (results.length > 0) {
            console.log("Found what we are looking for!");

            const messageBody = getMessageBody(content);
            const subject = `ESO monitoring - ${results.length} issues found!`;
            const message = createHTMLMessageUsingTemplate(subject, messageBody);

            await notifier.send(subject, message);
            saveDataToFile(data);
        } else {
            console.log("Nurodytoje zonoje nieko nerasta.");
        }
    } catch (error: any) {
        console.error("Error while handling ESO data.", error);
    }
}

function getMessageBody(content: string) {
    return `<p>Nurodytoje zonoje buvo rasta ESO pranešimų apie elektros trikdžius.</p>
            <p>Eiti į https://www.eso.lt/web/atjungimai-planiniai-neplaniniai ir pasitikrinti apie Pikutiškių apylinkėse esančius pranešimus.</p>
            <p>Rastos koordinatės:<br>
            ${content}
            </p>
            <p>Reaguoti reikia greitai, nes pranešimai ESO sistemoje ilgai neužsibūna. Visi momentiniai ESO duomenys išsaugoti Deniso serveryje, tačiau tai tik pranešimų koordinatės, ten nėra gedimo detalių.</p>
            <p>
            Tinkami pranešimai, tie kurie yra ant mūsų elektros linijos. Pasitikrinti galima: 
            <ul>
            <li>https://www.geoportal.lt/map/</i>
            <li>https://regia.lt/map/regia2</li>
            </ul>
            Jeigu pranešimai tinkami, pradėti gedimo akto procedūrą.
            </p>`;
}
