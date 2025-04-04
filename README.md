# 🍽️ RecipeApp – Rețetarul tău personal, simplu și inteligent

**RecipeApp** este o aplicație web pe care am creat-o pentru a-mi organiza rețetele preferate și pentru a decide rapid ce pot găti pe baza ingredientelor pe care le am în casă.

---

## 🎯 Funcționalități

- ✅ Adăugare rețete:
  - Nume, instrucțiuni, observații
  - Ingrediente (cu nume, cantitate, unitate de măsură)
  - Imagine opțională

- 🔍 Căutare rețete:
  - După nume (cu completare automată)
  - După **unul sau mai multe ingrediente**

- 📝 Modificare și ștergere rețete

- 🖼️ Vizualizare rețete în format card

- 📱 **Interfață responsive** – aplicația arată bine pe desktop și pe mobil

---

## 🚀 De ce am creat-o

> Nu mă puteam hotărî ce să gătesc.  
> Voiam să aleg din rețetele **preferate** și să știu **ce pot găti cu ce am în frigider**.  
> Așa s-a născut RecipeApp – rețetarul meu personal, personalizabil, și mereu accesibil.

---

## 🛠️ Tehnologii

- **Java 17+**
- **Spring Boot**
- **Thymeleaf** (template engine)
- **HTML + CSS + Bootstrap**
- **Vanilla JavaScript**
- **H2 / MySQL** (bază de date)

---

## ⚙️ Cum rulezi aplicația local

1. Clonează proiectul:
   ```bash
   git clone https://github.com/username/recipe-app.git
## 2. Deschide proiectul în IntelliJ IDEA (sau alt IDE cu suport Spring Boot)

Asigură-te că ai:

- Java 17+ instalat
- Maven configurat (opțional)

## 3. Rulează aplicația

Lansează clasa `RecipeAppApplication` din pachetul `com.recipeapp.recipe_app`.

Accesează aplicația în browser la:

```
http://localhost:8080
```

---

## 🗃️ Baza de date

Implicit se folosește baza de date **H2 in-memory**, cu consola disponibilă la:

```
http://localhost:8080/h2-console
```

(Username: `sa`, fără parolă)

---

## 🛡️ Trecerea la MySQL (opțional)

Dacă vrei ca datele să fie persistente, poți configura aplicația să folosească MySQL:

### 🔧 Modifică `application.properties` astfel:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/recipeapp
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

💡 **Notă:** Valorile sensibile sunt extrase din variabile de mediu (`DB_USERNAME`, `DB_PASSWORD`).  
Le poți seta direct în IntelliJ:  
`Run > Edit Configurations > Environment variables`

---

## 📦 Funcționalități posibile în viitor

- Autentificare cu conturi de utilizator
- Meal planner zilnic / săptămânal
- Export rețete în PDF
- Suport pentru categorii sau etichete (ex: vegetarian, desert etc.)
- Sincronizare în cloud sau backup

---

## 📸 Capturi de ecran

_(poți adăuga aici câteva imagini relevante din aplicație)_

---

## 📬 Feedback & sugestii

Proiectul este creat pentru uz personal, dar sunt deschis la idei și contribuții.  
Dacă ai sugestii sau întrebări, nu ezita să deschizi un issue sau să trimiți un mesaj!

---

## ✨ Licență

Proiect personal – în prezent nu este distribuit public.  
Dacă intenționezi să-l folosești sau să-l redistribui, te rog să iei legătura cu autorul.

---

> Creat cu pasiune pentru gătit și organizare 🙌

---

![ChatGPT Image Apr 4, 2025, 11_34_36 AM](https://github.com/user-attachments/assets/d1cbdf59-3bba-4886-9979-f65d76e53a93)

---

Made with 💖 by [George Felix Fericean](https://github.com/GeorgeFelixFericean)

