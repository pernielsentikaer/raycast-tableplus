import {ActionPanel, Color, Icon, List, OpenInBrowserAction} from "@raycast/api";
import plist from "plist";
import fs from "fs";
import os from "os";
import {useEffect, useState} from "react";
import {Connection, Group, ListItem, tintColors} from "./interfaces";

export default function DatabaseList() {

	const [state, setState] = useState<ListItem[]>();
	const [stateSingle, setStateSingle] = useState<ListItem[]>();
	const [isLoading, setLoading] = useState<boolean>();

	//TODO: Empty state flicker!

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

			const listItemsSingle = connectionsList.reduce((memo, connection) => {
				const groupId = connection.GroupID.toString();
				const group = groups.get(groupId);

				const conn: Connection = {
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

				if(connection.GroupID.toString() === "") {

						return [...memo, conn];

				}
				else
					return [...memo]

			}, [] as ListItem[]);

			const listItems = connectionsList.reduce((memo, connection) => {
				const groupId = connection.GroupID.toString();
				const group = groups.get(groupId);

				const conn: Connection = {
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

				if(connection.GroupID.toString() !== "") {

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
				}
				else
					return [...memo]

			}, [] as ListItem[]);

			setLoading(false);
			setState(listItems);
			setStateSingle(listItemsSingle);
		}

		fetch();

	}, []);

	return (
		<List isLoading={isLoading} searchBarPlaceholder="Filter connections...">

			{state && state.map((item) => {
				if (item.type !== 'connection') {

					const subtitle = `${item.connections.length} ${renderPluralIfNeeded(item.connections.length)}`;

					return <List.Section key={item.id} title={item.name} subtitle={subtitle}>
						{item.connections.map((connection) => (
							<ConnectionListItem key={connection.id} connection={connection}/>
						))}
					</List.Section>

				}
			})}

			{/* TODO: WRONG WAY BUT DOES WHAT I WANT */}
			{/* TODO: ONLY SHOW IF NEEDED */}
			{/* TODO: Count items? */}

			<List.Section key="Ungrouped" title="Ungrouped" subtitle={stateSingle?.length + " " + renderPluralIfNeeded(stateSingle?.length)}>
				{stateSingle && stateSingle.map((item) => {

					if (item.type === 'connection') {

						console.log(item)

						return <ConnectionListItem key={item.id} connection={item}/>

					}

				})}
			</List.Section>

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
		else if(connection.Driver === 'SQLite' && connection.isOverSSH)
			subtitle += ` : ${connection.DatabaseHost}`;

		let groupIcon = 'icon.png';
		if (connection.groupId) {
			if (fs.existsSync(`${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`)) {
				groupIcon = `${os.homedir()}/Library/Application Support/com.tinyapp.TablePlus/Data/${connection.groupId}`
			}
		}

		//TODO tintColor in icon may be wrong initialized - only show when added

		return (
			<List.Item
				id={connection.id}
				key={connection.id}
				title={connection.name}
				subtitle={subtitle}
				accessoryIcon={groupIcon}
				accessoryTitle={connection.Driver}
				icon={{source: Icon.Dot, tintColor: tintColors[connection.Enviroment]}}
				actions={
					<ActionPanel>
						<OpenInBrowserAction title="Open Database" url={`tableplus://?id=${connection.id}`}/>
					</ActionPanel>
				}
			/>
		);
	}
}
