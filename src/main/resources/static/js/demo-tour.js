document.addEventListener('DOMContentLoaded', () => {

    // Slide ↔ Text: click pe text → schimbă slide
    document.querySelectorAll('#indexDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#indexDemoCarousel').carousel(index);
            document.querySelectorAll('#indexDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Slide ↔ Text: când se schimbă slide-ul → evidențiază textul corespunzător
    $('#indexDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#indexDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });

    // Conectare textele din #publicDemoTexts cu sliderul #recipesDemoCarousel
    document.querySelectorAll('#publicDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#recipesDemoCarousel').carousel(index);
            document.querySelectorAll('#publicDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Când slide-ul se schimbă => actualizăm butonul activ
    $('#recipesDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#publicDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });

    // Scroll lin către #contact-section când se apasă pe slide-ul 3
    const feedbackImage = document.querySelector('.feedback-slide');
    if (feedbackImage) {
        feedbackImage.addEventListener('click', () => {
            const parentSlide = feedbackImage.closest('.carousel-item');
            if (parentSlide && parentSlide.classList.contains('active')) {
                const contactSection = document.querySelector('#contact-section');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // 🔄 Slide ↔ Text pentru demo-tour din pagina /home (logat)
    document.querySelectorAll('#loggedHomeDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#loggedHomeDemoCarousel').carousel(index);
            document.querySelectorAll('#loggedHomeDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    $('#loggedHomeDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#loggedHomeDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });

    // 🔄 Slide ↔ Text pentru demo-tour din pagina /add-recipe
    document.querySelectorAll('#addRecipeDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#addRecipeDemoCarousel').carousel(index);
            document.querySelectorAll('#addRecipeDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    $('#addRecipeDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#addRecipeDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });

    // 🔄 Slide ↔ Text pentru demo-tour din pagina /all-recipes
    document.querySelectorAll('#allRecipesDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#allRecipesDemoCarousel').carousel(index);
            document.querySelectorAll('#allRecipesDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    $('#allRecipesDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#allRecipesDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });

    // 🔄 Slide ↔ Text pentru demo-tour din pagina /recipe/{id}
    document.querySelectorAll('#recipeViewDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#recipeViewDemoCarousel').carousel(index);
            document.querySelectorAll('#recipeViewDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    $('#recipeViewDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#recipeViewDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });
    // 🔄 Slide ↔ Text pentru demo-tour din pagina /edit-recipe
    document.querySelectorAll('#editRecipeDemoTexts button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            $('#editRecipeDemoCarousel').carousel(index);
            document.querySelectorAll('#editRecipeDemoTexts button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    $('#editRecipeDemoCarousel').on('slid.bs.carousel', function (e) {
        const index = $(e.relatedTarget).index();
        document.querySelectorAll('#editRecipeDemoTexts button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    });
});
