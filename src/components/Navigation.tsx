export type TabId = "formation" | "players" | "settings";

interface NavigationProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "formation", label: "Formation" },
  { id: "players", label: "Players" },
  { id: "settings", label: "Settings" },
];

export function Navigation({ activeTab, onChange }: NavigationProps) {
  return (
    <nav className="navigation" aria-label="Primary navigation">
      {tabs.map((tab) => (
        <button
          className={`navigation__item${activeTab === tab.id ? " is-active" : ""}`}
          key={tab.id}
          type="button"
          aria-current={activeTab === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
