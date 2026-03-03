# Projekt i kursen DT210G, Fördjupad frontendutveckling

Detta är en webbtjänst i form av ett API som är skapat för en sida där man kan recensera böcker. Det hanterar säkerhet och autentisering genom registreing av användare, inloggning och användning av JWT för sessionshantering. APIet används också för att hantera och lagra sidans recensioner, det använder sig av CRUD-operationer, det vill säga CREATE, READ, UPDATE och DELETE. Projektet är skapad med hjälp av NodeJs, Express, Mongoose och NoSQL-databasen MongoDB Atlas.

### Installation av databas

APIet är kopplat till en MongoDB Atlas-databas. För att komma igång, börja med att klona ned källkodsfilerna. Kör sedan kommandot "npm install" för att installera de nödvändiga npm-paketen. Slutligen, kör skriptet "npm run serve".

### Länk till API

-

### Användning av API

Nedan finns en beskriving av hur man på olika sätt kan nå APIet:

| Metod | Ändpunkt | Beskrivning |
|---|---|---|
| POST | /register | Lägger till en ny användare. Exempel på JSON-data: { "username": "user", "email": "email@email.com", "password": "password" }. |
| POST | /login | Loggar in en användare. Exempel på JSON-data: { "username": "user", "password": "password" }. |
| GET | /review | Hämtar recensioner. Exempel på JSON-data: [{ "bookId": "iCWgDwAAQBAJ", "reviewText": "Bra bok!", "rating": 5, "user": { "username": "user", "email": "email@email.com" } }]. |
| GET | /review:id | Hämtar en enskild recension. |
| POST | /review | Lägger till en ny recension. Detta är en skyddad route och kräver ett JWT-token för att kunna nås. |
| DELETE | /review/id | Tar bort en recension. Detta är en skyddad route och kräver ett JWT-token för att kunna nås. |
| PUT | /review/id | Uppdaterar en recension. Detta är en skyddad route och kräver ett JWT-token för att kunna nås. |
| GET | /book:id | Hämtar en bok via Google Books API samt alla recensioner för den boken. |
