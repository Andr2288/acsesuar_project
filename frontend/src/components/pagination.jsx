import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    className = ""
}) => {
    // Якщо тільки одна сторінка, не показуємо пагінацію
    if (totalPages <= 1) return null;

    // Обчислюємо діапазон сторінок для відображення
    const getPageNumbers = () => {
        const delta = 2; // Кількість сторінок з кожного боку від поточної
        const range = [];
        const rangeWithDots = [];

        // Завжди показуємо першу сторінку
        range.push(1);

        // Додаємо сторінки навколо поточної
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        // Завжди показуємо останню сторінку
        if (totalPages > 1) {
            range.push(totalPages);
        }

        // Додаємо крапки, якщо потрібно
        let prev = 0;
        for (const page of range) {
            if (page - prev > 1) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(page);
            prev = page;
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    // Обчислюємо інформацію про поточні елементи
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Інформація про елементи */}
            <div className="text-sm text-gray-600">
                Показано <span className="font-medium">{startItem}</span> до{" "}
                <span className="font-medium">{endItem}</span> з{" "}
                <span className="font-medium">{totalItems}</span> результатів
            </div>

            {/* Елементи управління пагінацією */}
            <div className="flex items-center gap-2">
                {/* Кількість елементів на сторінку */}
                {onItemsPerPageChange && (
                    <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm text-gray-600">Показати:</span>
                        <select
                            className="select select-bordered select-sm"
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                )}

                {/* Кнопки навігації */}
                <div className="join">
                    {/* Перша сторінка */}
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="Перша сторінка"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Попередня сторінка */}
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Попередня сторінка"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Номери сторінок */}
                    {pageNumbers.map((pageNumber, index) => (
                        pageNumber === '...' ? (
                            <span key={`dots-${index}`} className="join-item btn btn-sm btn-disabled">
                                ...
                            </span>
                        ) : (
                            <button
                                key={pageNumber}
                                className={`join-item btn btn-sm ${
                                    currentPage === pageNumber ? 'btn-active btn-primary' : ''
                                }`}
                                onClick={() => onPageChange(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        )
                    ))}

                    {/* Наступна сторінка */}
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Наступна сторінка"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Остання сторінка */}
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Остання сторінка"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;