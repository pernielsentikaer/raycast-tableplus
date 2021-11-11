import {ActionPanel, Icon, List, OpenInBrowserAction} from "@raycast/api";
import plist from "plist";
import fs from "fs";
import os from "os";
import {useEffect, useState} from "react";
import {Connection, Group, tintColors} from "./interfaces";

const EmptyGroupID = '__EMPTY__';

export default function DatabaseList() {

	const [state, setState] = useState<{ connections: Group[] }>({connections: []});

	useEffect(() => {

		async function fetch() {

			const tablePlusLocation = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/Connections.plist`;
			const groupLocations = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/ConnectionGroups.plist`;

			const connectionsList = plist.parse(fs.readFileSync(tablePlusLocation, "utf8")) as ReadonlyArray<plist.PlistObject>;
			const groupList = plist.parse(fs.readFileSync(groupLocations, "utf8")) as ReadonlyArray<plist.PlistObject>;

			const groups = new Map<string, Group>(groupList.map((group) =>
				[group.ID.toString(), {id: group.ID.toString(), name: group.Name.toString(), connections: []}]
			))
			groups.set(EmptyGroupID, {
				id: EmptyGroupID,
				name: 'Ungrouped',
				connections: []
			});

			connectionsList.forEach((connection) => {
				const groupId = connection.GroupID?.toString() !== '' ? connection.GroupID?.toString() : EmptyGroupID;

				const conn: Connection = {
					id: connection.ID.toString(),
					groupId,
					groupName: '',
					name: connection.ConnectionName.toString() ?? '',
					driver: connection.Driver.toString(),
					isSocket: connection.isUseSocket === 1,
					isOverSSH: connection.isOverSSH === 1,
					database: connection.DatabaseName.toString(),
					ServerAddress: connection.ServerAddress.toString(),
					DatabaseHost: connection.DatabaseHost.toString(),
					Driver: connection.Driver.toString(),
					Environment: connection.Enviroment.toString(),
				};

				groups.get(groupId)?.connections.push(conn);
			});

			setState((oldState) => ({
				...oldState,
				connections: Array.from(groups.values()),
			}))

		}

		fetch();
	}, []);

	console.log(state.connections)

	return (
		<List isLoading={state.connections.length === 0} searchBarPlaceholder="Filter connections...">
			{state && state.connections.map((item) => {
				const subtitle = `${item.connections.length} ${renderPluralIfNeeded(item.connections.length)}`;

				return <List.Section key={item.id} title={item.name} subtitle={subtitle}>
					{item.connections.map((connection) => (
						<ConnectionListItem key={connection.id} connection={connection}/>
					))}
				</List.Section>
			})}
		</List>
	);

	function renderPluralIfNeeded(itemsLength: number) {
		return `item${itemsLength > 1 ? 's' : ''}`;
	}

	function ConnectionListItem(props: { connection: Connection }) {
		const connection = props.connection;

		let subtitle = connection.isOverSSH ? 'SSH' : connection.isSocket ? 'SOCKET' : connection.DatabaseHost;
		if (connection.database && connection.Driver !== 'SQLite')
			subtitle += ` : ${connection.database}`;
		else if (connection.Driver === 'SQLite' && connection.isOverSSH)
			subtitle += ` : ${connection.DatabaseHost}`;

		let groupIcon = 'icon.png';
		if (connection.groupId) {
			if (fs.existsSync(`${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`)) {
				groupIcon = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`
			}
		}

		return (
			<List.Item
				id={connection.id}
				key={connection.id}
				title={connection.name}
				subtitle={subtitle}
				accessoryIcon={groupIcon}
				accessoryTitle={connection.Driver}
				icon={{source: Icon.Dot, tintColor: tintColors[connection.Environment]}}
				actions={
					<ActionPanel>
						<OpenInBrowserAction title="Open Database" url={`tableplus://?id=${connection.id}`}/>
					</ActionPanel>
				}
			/>
		);
	}
}
