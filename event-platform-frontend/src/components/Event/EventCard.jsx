export const EventCard = ({
    title, description, imageUrl
}) => {
    return (
        <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="aspect-[16/9]">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold text-[#5A4A42] mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </article>
    );
}