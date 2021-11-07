import {ActionPanel, List, OpenInBrowserAction} from "@raycast/api";
import plist from "plist";
import fs from "fs";
import os from "os";
import {useEffect, useState} from "react";
import {Connection, Group, Datas} from "./interfaces";

export default function DatabaseList() {

	const [state, setState] = useState<{ connections: Connection[] }>({connections: []});

	useEffect(() => {

		async function fetch() {

			const tablePlusLocation = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/Connections.plist`;
			const groupLocations = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/ConnectionGroups.plist`;

			const connectionsList = plist.parse(fs.readFileSync(tablePlusLocation, "utf8")) as ReadonlyArray<plist.PlistObject>;
			const groupList = plist.parse(fs.readFileSync(groupLocations, "utf8")) as ReadonlyArray<plist.PlistObject>;

			const groups = groupList.map((group) => {
				return {id: group.ID, name: group.Name} as Group;
			})

			let data = {} as Datas;

			const connections = connectionsList.map((connection) => {

				const groupName = findValue(groups, connection.GroupID).name ?? '';
				const name = connection.ConnectionName ?? ''
				const ItemData = {
					id: connection.ID,
					groupId: connection.GroupID,
					groupName: groupName,
					name: name,
					driver: connection.Driver,
					isSocket: connection.isUseSocket,
					isOverSSH: connection.isOverSSH,
					database: connection.DatabaseName,
					ServerAddress: connection.ServerAddress,
					Enviroment: connection.Enviroment
				};

				if (!data[connection.GroupID as string]) {
					data[connection.GroupID as string] = [ItemData]
				} else {
					data[connection.GroupID as string].push(ItemData)
				}

				return ItemData as Connection;
			})



			setState((oldState) => ({
				...oldState,
				connections: connections,
				groups: groups,
				data: data
			}));

		}

		fetch();

	}, []);

	return (
		<List isLoading={state.connections.length === 0} searchBarPlaceholder="Filter connections...">

			{state.connections.map((connection) => (
				<ConnectionListItem connection={connection}/>
			))}




		</List>
	);

	/*
	return (
		<List>
			<List.Section title="Deco" subtitle="gg">
				<List.Item icon="local.png" title="Deco LOCAL" />
				<List.Item icon="development.png" title="Deco DEV" />
			</List.Section>
			<List.Section title="Ungroups">
				<List.Item icon="icon.png" title="Another" accessoryTitle="[DEV]" />
			</List.Section>
		</List>
	);
	 */

	function ConnectionListItem(props: { connection: Connection }) {
		const connection = props.connection;

		let subtitle = connection.isOverSSH ? 'SSH': connection.isSocket ? 'SOCKET' : connection.ServerAddress;
		if(connection.database)
			subtitle += ` : ${connection.database}`;

		let assIcon = 'icon.png';
		const icon = `${connection.Enviroment}.png`
		if(connection.groupId) {
			if(fs.existsSync(`${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`)) {
				assIcon = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`
			}
		}

		switch (connection.Enviroment) {
			case 'local':
				ggIcon = "🟢";
				break;
			case 'development':
				ggIcon = "🔵";
				break;
			case 'testing':
				ggIcon = "🟣";
				break;
			case 'staging':
				ggIcon = "🟠";
				break;
			case 'production':
				ggIcon = "🔴";
				break;

		}

		return (
			<List.Item
				id={connection.id}
				key={connection.id}
				title={connection.name}
				subtitle={subtitle}
				icon={icon}
				accessoryTitle={connection.Enviroment}
				accessoryIcon={ggIcon}
				actions={
					<ActionPanel>
						<OpenInBrowserAction title="Open Database" url={`tableplus://?id=${connection.id}`}/>
					</ActionPanel>
				}
			/>
		);
	}

	function findValue(groups: any, id: any) {
		return groups.find(i => i.id === id) ?? []
	}

	/*
	const [state, setState] = useState<Item[]>([]);
	const [query, setQuery] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState(false)
	const tablePlusLocation = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/Connections.plist`;
	const groupLocations = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/ConnectionGroups.plist`;

	useEffect(() => {
		try {
			setLoading(true)
			const connections = plist.parse(fs.readFileSync(tablePlusLocation, "utf8")) as ReadonlyArray<plist.PlistObject>;
			const groups = plist.parse(fs.readFileSync(groupLocations, "utf8")) as ReadonlyArray<plist.PlistObject>;

			const groupsObj = groups.map((connection) => {
				return {id: connection.ID, name: connection.Name} as GroupItem;
			})

			const obj = connections.map((connection) => {
				return {id: connection.ID, groupName: connection.GroupID, name: connection.ConnectionName} as Item;
			})
			setLoading(false)

			setState(obj);
		} catch (error) {
			console.log(error)
		}
	}, []);

	return (
		<List
			isLoading={loading}
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
									<OpenInBrowserAction title="Open Database" url={`tableplus://?id=${process.id}`}/>
								</ActionPanel>

							}
						/>
					);
				})}
		</List>
	);
	 */
}
