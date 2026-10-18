interface HeaderProps {
    title: string
}

function Header({ title }: HeaderProps) {
    return (
        <header className="topbar">
            <h1 className="topbar-title">{title}</h1>

            <div className="topbar-user">
                <div className="topbar-avatar">AS</div>
                <div>
                    <div>Alexandru Știrbu</div>
                    <div className="topbar-role">Reception</div>
                </div>
            </div>

        </header>

    )
}

export default Header