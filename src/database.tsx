import { ActionPanel, CopyToClipboardAction, FileIcon, Icon, List, showHUD } from "@raycast/api";
import plist from "plist";
import fs from "fs";
import os from "os";
import { useEffect, useState } from "react";

export default function DatabaseList() {
	const [state, setState] = useState<Item[]>([]);
	const [query, setQuery] = useState<string | undefined>(undefined);
	const tablePlusLocation = `${os.homedir()}/Library/Application\ Support/com.tinyapp.TablePlus/Data/Connections.plist`;

	useEffect(() => {

			const obj = plist.parse(fs.readFileSync(tablePlusLocation, "utf8"));
			obj.children.map((line) => {

				return {
					line.ID,
					line.ConnectionName,
					line.GroupID
				}
			})

			setState(obj);

	}, []);

	return (
		<List
			isLoading={state.length === 0}
			searchBarPlaceholder="Filter by name..."
			onSearchTextChange={(query) => setQuery(query)}
		>
			{state
				.filter(
					(process) =>
						(query == null || process.name.toLowerCase().includes(query.toLowerCase()))
				)
				.map((process, index) => {
					return (
						<List.Item
							key={index}
							title={process.name}
							subtitle={process.groupName}
							icon='/Applications/TablePlus.app/Contents/Resources/AppIcon.icns'
							actions={
								<ActionPanel>

								</ActionPanel>
							}
						/>
					);
				})}
		</List>
	);
}

type Item = {
	id: string;
	groupName: string;
	name: string;
};
