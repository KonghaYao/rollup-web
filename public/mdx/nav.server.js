const dateTimeFormat = new Intl.DateTimeFormat("en", { dateStyle: "long" });

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
                <NavItem key={d.name} {...rest} item={d} />
            ))}
        </ol>
    );
}

export function NavItem(props) {
    const {
        item,
        name: activeName,
        includeDescription,
        includePublished,
    } = props;
    const { name, children, data = {} } = item;
    const { matter = {}, meta = {}, navExcludeGroup, navSortItems } = data;
    const title = matter.title || meta.title;
    const defaultTitle = name.replace(/\/$/, "").split("/").pop();

    let description;
    let published;

    if (includeDescription) {
        if (meta.descriptionHast) {
            description = "";
        } else {
            description = matter.description || meta.description || null;

            if (description) {
                description = (
                    <div className="nav-description">
                        <p>{description}</p>
                    </div>
                );
            }
        }
    }

    if (includePublished && (matter.published || meta.published)) {
        published = dateTimeFormat.format(matter.published || meta.published);
    }

    return (
        <li>
            {title ? (
                <a
                    href={name}
                    aria-current={name === activeName ? "page" : undefined}
                >
                    {title}
                </a>
            ) : (
                defaultTitle
            )}
            {published ? " — " + published : null}
            {description || null}
            {!navExcludeGroup && children.length > 0 ? (
                <NavGroup
                    items={children}
                    sort={navSortItems}
                    name={activeName}
                />
            ) : null}
        </li>
    );
}
