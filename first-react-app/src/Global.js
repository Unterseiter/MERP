import './Global.css';

function Global() {
  return (
    <div>

        <section>
            <h2>Главные события города</h2>
            <div>
                <button>←</button>
                <button>→</button>

                <article>
                    <img src="../img/main_corp.png" alt="Масленица в КубГАУ"></img>
                    <h3>Масленица в КубГАУ</h3>
                    <p>Описание праздника и детали мероприятия...</p>
                </article>

                <article>
                    <img src="../img/gallery_KRD.jpg" alt="Новый год в Галерее"></img>
                    <h3>Новый год в Галерее</h3>
                    <p>Описание новогоднего мероприятия...</p>
                </article>
            </div>
        </section>

    </div>
  );
}

export default Global;
