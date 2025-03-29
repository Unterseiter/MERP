import './AdditionalHeader.css';

function AdditionalHeader() {
    return (
        <div>
            <h2>Частные объявления</h2>
            <nav>
                <div>
                    <button>
                        Фильтр
                    </button>
                    <button>
                        Сортировка
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default AdditionalHeader;