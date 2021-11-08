import {ActionPanel, List, OpenInBrowserAction} from "@raycast/api";
import plist from "plist";
import fs from "fs";
import os from "os";
import {useEffect, useState} from "react";
import {Connection, Group, ListItem} from "./interfaces";

export default function DatabaseList() {

	const [state, setState] = useState<ListItem[]>();
	const [isLoading, setLoading] = useState<boolean>();

	useEffect(() => {
		async function fetch() {
			setLoading(true);

			const tablePlusLocation = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/Connections.plist`;
			const groupLocations = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/ConnectionGroups.plist`;

			const connectionsList = plist.parse(fs.readFileSync(tablePlusLocation, "utf8")) as ReadonlyArray<plist.PlistObject>;
			const groupList = plist.parse(fs.readFileSync(groupLocations, "utf8")) as ReadonlyArray<plist.PlistObject>;

			const groups = new Map<string, Group>(groupList.map((group) => {
				return [group.ID.toString(), {type: 'group', id: group.ID.toString(), name: group.Name.toString(), connections: []}];
			}))

			const listItems = connectionsList.reduce((memo, connection) => {
				let groupId = connection.GroupID.toString();
				let group = groups.get(groupId);

				let conn: Connection = {
					type: 'connection',
					id: connection.ID.toString(),
					groupId: connection.GroupID?.toString(),
					groupName: '',
					name: connection.ConnectionName.toString() ?? '',
					driver: connection.Driver.toString(),
					isSocket: connection.isUseSocket === 1,
					isOverSSH: connection.isOverSSH === 1,
					database: connection.DatabaseName.toString(),
					ServerAddress: connection.ServerAddress.toString(),
					DatabaseHost: connection.DatabaseHost.toString(),
					Driver: connection.Driver.toString(),
					Enviroment: connection.Enviroment.toString(),
				};

				console.log(memo)

				if (group === undefined) {
					return [...memo, conn];
				} else {
					group.connections.push(conn)
					if (memo.find((group) => group.type === 'group' && group.id === groupId)) {
						return memo;
					} else {
						return [...memo, group];
					}
				}



			}, [] as ListItem[]);

			setLoading(false);
			setState(listItems);
		}

		fetch();
	}, []);

	return (
		<List isLoading={isLoading} searchBarPlaceholder="Filter connections...">
			{state && state.map((item) => {
				if (item.type === 'connection') {
					return <ConnectionListItem key={item.id} connection={item}/>
				} else {

					const subtitle = `${item.connections.length} items`;

					return <List.Section key={item.id} title={item.name} subtitle={subtitle}>
						{item.connections.map((connection) => (
							<ConnectionListItem key={connection.id} connection={connection} />
						))}
					</List.Section>
				}
			})}
		</List>
	);

	function ConnectionListItem(props: { connection: Connection }) {
		const connection = props.connection;

		let subtitle = connection.isOverSSH ? 'SSH': connection.isSocket ? 'SOCKET' : connection.DatabaseHost;
		if(connection.database)
			subtitle += ` : ${connection.database}`;

		let assIcon = 'icon.png';
		const icon = `${connection.Enviroment}.png`
		if(connection.groupId) {
			if(fs.existsSync(`${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`)) {
				assIcon = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`
			}
		}

		return (
			<List.Item
				id={connection.id}
				key={connection.id}
				title={connection.name}
				subtitle={subtitle}
				icon={assIcon}
				accessoryTitle={connection.Driver}
				accessoryIcon={icon}
				actions={
					<ActionPanel>
						<OpenInBrowserAction title="Open Database" url={`tableplus://?id=${connection.id}`}/>
					</ActionPanel>
				}
			/>
		);
	}

}
