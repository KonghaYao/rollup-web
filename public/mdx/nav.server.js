export function NavGroup(props) {
    const {
        items,
        className,
        sort = "navSortSelf,meta.title",
        ...rest
    } = props;

    return (
        <ol {...{ className }}>
            {items.map((d) => (
                <li key={d.name}>{d.name}</li>
            ))}
        </ol>
    );
}
